#!/usr/bin/env node
/**
 * Caroni — GitHub Issues + Projects sync (tasks-as-code).
 *
 * Reads `tasks/board.yaml` and idempotently creates/updates:
 *   labels → milestones → issues (matched by a hidden key marker in the issue body).
 *
 * Auth: uses the `gh` CLI — run `gh auth login` once (scopes: repo, project).
 * No tokens are stored by this tool.
 *
 * Usage:
 *   pnpm sync              # create/update labels, milestones, issues
 *   pnpm sync --dry-run    # preview only, no writes
 *   pnpm sync --project     # also add issues to a Project and set Status (needs GH_PROJECT_NUMBER)
 */
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import yaml from 'js-yaml';
import 'dotenv/config';

type Card = {
  key: string;
  name: string;
  list: string;
  labels?: string[];
  // Structured body (rendered into the standard template). `desc` overrides all.
  summary?: string;
  current_state?: string;
  requirements?: string;
  acceptance?: string[];
  dependencies?: string[];
  desc?: string;
};
type Def = {
  repo?: string;
  lists: string[];
  milestones: Record<string, string>;
  labels: { name: string; color: string }[];
  cards: Card[];
};

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BOARD_FILE = process.env.BOARD_FILE
  ? path.resolve(process.env.BOARD_FILE)
  : path.join(ROOT, 'tasks', 'board.yaml');

const DRY = process.argv.includes('--dry-run');
const USE_PROJECT = process.argv.includes('--project') || !!process.env.GH_PROJECT_NUMBER;
const PROJECT_NUMBER = process.env.GH_PROJECT_NUMBER;
const PROJECT_OWNER = process.env.GH_PROJECT_OWNER;

const KEY_RE = /<!--\s*caroni-key:\s*([^\s]+)\s*-->/;
const MARKER = (k: string) => `\n\n<!-- caroni-key: ${k} -->`;

/** Render a card into the standard issue body template. Preserves ticked acceptance boxes. */
function renderBody(card: Card, prevBody?: string): string {
  if (card.desc) return card.desc.trimEnd();

  // Carry over "[x]" state from the existing issue body, matched by criterion text.
  const checked = new Map<string, boolean>();
  if (prevBody) {
    for (const line of prevBody.split('\n')) {
      const m = /^\s*-\s*\[([ xX])\]\s*(.+?)\s*$/.exec(line);
      if (m) checked.set(m[2], m[1].toLowerCase() === 'x');
    }
  }

  const parts: string[] = [];
  if (card.summary) parts.push(`Summary\n${card.summary.trim()}`);
  if (card.current_state) parts.push(`Current State\n${card.current_state.trim()}`);
  if (card.requirements) parts.push(`Requirements\n${card.requirements.trim()}`);
  if (card.acceptance?.length)
    parts.push(
      `Acceptance Criteria\n${card.acceptance
        .map((a) => `- [${checked.get(a.trim()) ? 'x' : ' '}] ${a}`)
        .join('\n')}`,
    );
  const deps = card.dependencies?.length
    ? card.dependencies.map((d) => `- ${d}`).join('\n')
    : '- None';
  parts.push(`Dependencies\nDepends on:\n${deps}`);
  return parts.join('\n\n');
}
const STATUS_LABEL: Record<string, string> = {
  Backlog: 'status:todo',
  'To Do': 'status:todo',
  'In Progress': 'status:in-progress',
  Done: 'status:done',
};

function gh(args: string[], allowFail = false): string {
  try {
    return execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const err = e as { stderr?: Buffer; message: string };
    if (allowFail) return '';
    throw new Error(`gh ${args.join(' ')}\n${err.stderr?.toString() ?? err.message}`);
  }
}
function ghJson<T>(args: string[]): T {
  const out = gh(args);
  return JSON.parse(out) as T;
}
function log(msg: string) {
  console.log(DRY ? `[dry] ${msg}` : msg);
}

async function main() {
  gh(['auth', 'status']); // throws if not logged in

  const def = yaml.load(readFileSync(BOARD_FILE, 'utf8')) as Def;
  const repo =
    def.repo ||
    gh(['repo', 'view', '--json', 'nameWithOwner', '-q', '.nameWithOwner']).trim();
  const owner = repo.split('/')[0];

  console.log(`Caroni GitHub sync${DRY ? ' [dry-run]' : ''}`);
  console.log(`Repo: ${repo}   Source: ${path.relative(ROOT, BOARD_FILE)}`);

  // ── labels ────────────────────────────────────────────────────────────────
  const existingLabels = new Set(
    ghJson<Array<{ name: string }>>(['label', 'list', '--limit', '500', '--json', 'name']).map(
      (l) => l.name,
    ),
  );
  for (const l of def.labels) {
    if (existingLabels.has(l.name)) {
      if (DRY) log(`would update label "${l.name}"`);
      else gh(['label', 'edit', l.name, '--color', l.color], true);
    } else {
      if (DRY) log(`would create label "${l.name}"`);
      else {
        gh(['label', 'create', l.name, '--color', l.color]);
        console.log(`+ label ${l.name}`);
      }
    }
  }

  // ── milestones ────────────────────────────────────────────────────────────
  const msList = ghJson<Array<{ number: number; title: string }>>([
    'api',
    `repos/${repo}/milestones?state=all&per_page=100`,
  ]);
  const msByTitle = new Map(msList.map((m) => [m.title, m.number]));
  for (const title of Object.values(def.milestones)) {
    if (msByTitle.has(title)) continue;
    if (DRY) {
      log(`would create milestone "${title}"`);
      msByTitle.set(title, -1);
      continue;
    }
    const created = ghJson<{ number: number }>([
      'api',
      '-X',
      'POST',
      `repos/${repo}/milestones`,
      '-f',
      `title=${title}`,
    ]);
    console.log(`+ milestone ${title}`);
    msByTitle.set(title, created.number);
  }

  // ── existing issues (marker → number) ─────────────────────────────────────
  const issues = ghJson<Array<{ number: number; body: string | null }>>([
    'api',
    `repos/${repo}/issues?state=all&per_page=100`,
  ]);
  const byKey = new Map<string, number>();
  const bodyByKey = new Map<string, string>();
  for (const it of issues) {
    const m = KEY_RE.exec(it.body || '');
    if (m) {
      byKey.set(m[1], it.number);
      bodyByKey.set(m[1], it.body || '');
    }
  }

  // ── issues ────────────────────────────────────────────────────────────────
  let created = 0;
  let updated = 0;
  for (const card of def.cards) {
    const msKey = card.key.split('-')[0];
    const msTitle = def.milestones[msKey];
    const msNumber = msTitle ? msByTitle.get(msTitle) : undefined;
    const labels = [...(card.labels ?? [])];
    if (!USE_PROJECT) {
      const sl = STATUS_LABEL[card.list];
      if (sl) labels.push(sl);
    }
    const prevBody = byKey.has(card.key) ? bodyByKey.get(card.key) : undefined;
    const body = renderBody(card, prevBody) + MARKER(card.key);

    const args = [
      'api',
      '-X',
      byKey.has(card.key) ? 'PATCH' : 'POST',
      byKey.has(card.key) ? `repos/${repo}/issues/${byKey.get(card.key)}` : `repos/${repo}/issues`,
      '-f',
      `title=${card.name}`,
      '-f',
      `body=${body}`,
      ...labels.flatMap((l) => ['-f', `labels[]=${l}`]),
    ];
    if (msNumber && msNumber > 0) args.push('-F', `milestone=${msNumber}`);

    if (byKey.has(card.key)) {
      if (DRY) log(`would update #${byKey.get(card.key)} (${card.key})`);
      else {
        gh(args);
        console.log(`~ #${byKey.get(card.key)} ${card.key}`);
      }
      updated++;
    } else {
      if (DRY) log(`would create ${card.key} "${card.name}"`);
      else {
        const issue = ghJson<{ number: number }>(args);
        byKey.set(card.key, issue.number);
        console.log(`+ #${issue.number} ${card.key}`);
      }
      created++;
    }
  }

  // ── project (optional) ────────────────────────────────────────────────────
  if (USE_PROJECT && PROJECT_NUMBER) {
    await syncProject(def, repo, owner);
  } else if (USE_PROJECT) {
    console.warn('GH_PROJECT_NUMBER not set — skipping Project status sync.');
  }

  console.log(`\nDone. ${created} created, ${updated} updated, ${def.cards.length} total.`);
  if (!USE_PROJECT) {
    console.log('Tip: pass --project + set GH_PROJECT_NUMBER to drive a Project board Status.');
  }
}

async function syncProject(def: Def, repo: string, owner: string) {
  const projOwner = PROJECT_OWNER || owner;
  const fields = ghJson<Array<{ id: string; name: string; options?: Array<{ id: string; name: string }> }>>(
    ['project', 'field-list', PROJECT_NUMBER!, '--owner', projOwner, '--format', 'json'],
  );
  const statusField = fields.find((f) => f.name === 'Status');
  if (!statusField?.options) throw new Error('No "Status" field on the project.');
  const optionId = new Map(statusField.options.map((o) => [o.name, o.id]));
  const projectId = ghJson<{ id: string }>([
    'project', 'view', PROJECT_NUMBER!, '--owner', projOwner, '--format', 'json',
  ]).id;

  const keyToNumber = new Map<string, number>();
  for (const it of ghJson<Array<{ number: number; body: string | null }>>([
    'api', `repos/${repo}/issues?state=all&per_page=100`,
  ])) {
    const m = KEY_RE.exec(it.body || '');
    if (m) keyToNumber.set(m[1], it.number);
  }

  const statusName = (list: string) =>
    list === 'In Progress' ? 'In Progress' : list === 'Done' ? 'Done' : 'Todo';

  for (const card of def.cards) {
    const number = keyToNumber.get(card.key);
    const oid = optionId.get(statusName(card.list));
    if (!number || !oid) continue;
    if (DRY) {
      log(`would set #${number} status → ${statusName(card.list)}`);
      continue;
    }
    const item = ghJson<{ id: string }>([
      'project', 'item-add', PROJECT_NUMBER!, '--owner', projOwner,
      '--url', `https://github.com/${repo}/issues/${number}`, '--format', 'json',
    ]);
    gh([
      'project', 'item-edit', '--id', item.id, '--field-id', statusField.id,
      '--project-id', projectId, '--single-select-option-id', oid,
    ]);
    console.log(`· #${number} → ${statusName(card.list)}`);
  }
}

main().catch((err) => {
  console.error('\nSync failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
