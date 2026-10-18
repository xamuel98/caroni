import type { Ability } from '@caroni/shared-types';

/**
 * Compiles the permission glossary + role assignments into the data the API
 * serves as "abilities". Pure (string in → data out) so it is unit-testable and
 * can be run by the generator that emits `catalogue.generated.ts`.
 */
export interface CompiledCatalogue {
  abilities: Ability[];
  roleGrants: Record<string, string[]>;
}

const CAPABILITIES = new Set(['visible', 'modifiable', 'actionable', 'deletable', 'archivable']);
const APPS = new Set(['consumer', 'ops']);

export function compileCatalogue(csv: string, yaml: string): CompiledCatalogue {
  const abilities = parseGlossaryCsv(csv);
  const roleGrants = parseRolesYaml(yaml);
  validate(abilities, roleGrants);
  const sorted = [...abilities].sort((a, b) => a.permission_id.localeCompare(b.permission_id));
  return { abilities: sorted, roleGrants };
}

/** The catalogue entries granted to a caller holding `roles` (plus the grant list). */
export function abilitiesForRoles(
  roles: string[],
  catalogue: CompiledCatalogue,
): { grants: string[]; abilities: Ability[] } {
  const granted = new Set<string>();
  for (const role of roles) {
    for (const permissionId of catalogue.roleGrants[role] ?? []) granted.add(permissionId);
  }
  const grants = [...granted].sort();
  const abilities = catalogue.abilities.filter((a) => granted.has(a.permission_id));
  return { grants, abilities };
}

export function parseGlossaryCsv(csv: string): Ability[] {
  const rows = parseCsv(csv).filter((row) => row.some((cell) => cell.trim() !== ''));
  const [header, ...body] = rows;
  if (!header) throw new Error('permission glossary is empty');

  const column = (name: string): number => {
    const index = header.indexOf(name);
    if (index === -1) throw new Error(`permission glossary is missing column: ${name}`);
    return index;
  };
  const c = {
    permission_id: column('permission_id'),
    app: column('app'),
    module: column('module'),
    resource_kind: column('resource_kind'),
    section: column('section'),
    action: column('action'),
    capability: column('capability'),
    label: column('label'),
    surface: column('surface'),
  };

  return body.map((row, i) => {
    const line = i + 2; // header is line 1
    const permissionId = (row[c.permission_id] ?? '').trim();
    if (!permissionId) throw new Error(`permission glossary line ${line}: empty permission_id`);
    return {
      permission_id: permissionId,
      app: (row[c.app] ?? '').trim() as Ability['app'],
      module: (row[c.module] ?? '').trim(),
      resource_kind: (row[c.resource_kind] ?? '').trim(),
      section: (row[c.section] ?? '').trim() || undefined,
      action: (row[c.action] ?? '').trim(),
      capability: (row[c.capability] ?? '').trim() as Ability['capability'],
      label: (row[c.label] ?? '').trim(),
      surface: (row[c.surface] ?? '').trim() || undefined,
    };
  });
}

export function parseRolesYaml(yaml: string): Record<string, string[]> {
  const grants: Record<string, string[]> = {};
  let current: string | null = null;

  for (const raw of yaml.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem) {
      if (!current) throw new Error(`roles.yaml: list item before any role: ${trimmed}`);
      grants[current]!.push(listItem[1]!.trim());
      continue;
    }

    const role = line.match(/^([^\s#].*?):\s*$/);
    if (role) {
      current = role[1]!.trim();
      grants[current] = [];
      continue;
    }

    throw new Error(`roles.yaml: unrecognized line: ${line}`);
  }

  return grants;
}

function validate(abilities: Ability[], roleGrants: Record<string, string[]>): void {
  const seen = new Set<string>();
  for (const ability of abilities) {
    if (seen.has(ability.permission_id)) {
      throw new Error(`duplicate permission_id in glossary: ${ability.permission_id}`);
    }
    seen.add(ability.permission_id);
    if (!CAPABILITIES.has(ability.capability)) {
      throw new Error(`${ability.permission_id}: invalid capability "${ability.capability}"`);
    }
    if (!APPS.has(ability.app)) {
      throw new Error(`${ability.permission_id}: invalid app "${ability.app}"`);
    }
  }

  for (const [role, permissions] of Object.entries(roleGrants)) {
    for (const permissionId of permissions) {
      if (!seen.has(permissionId)) {
        throw new Error(`role "${role}" grants unknown permission "${permissionId}"`);
      }
    }
  }
}

/** Minimal RFC 4180 CSV parser (quoted fields, escaped quotes, CRLF). */
function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i]!;
    if (inQuotes) {
      if (char === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}
