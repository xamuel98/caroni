import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { abilitiesForRoles, compileCatalogue, parseGlossaryCsv, parseRolesYaml } from './catalogue';
import { CATALOGUE, ROLE_GRANTS } from './catalogue.generated';

const docsDir = resolve(process.cwd(), '../../docs/authz');
const read = (file: string): string => readFileSync(resolve(docsDir, file), 'utf8');

describe('catalogue compiler', () => {
  it('parses the glossary', () => {
    const abilities = parseGlossaryCsv(read('permission-glossary.csv'));
    expect(abilities.length).toBeGreaterThan(0);
    expect(abilities.every((a) => a.permission_id && a.label && a.action)).toBe(true);
  });

  it('parses roles whose names contain colons', () => {
    const grants = parseRolesYaml(read('roles.yaml'));
    expect(Object.keys(grants)).toContain('ops:kyc_analyst');
    expect(grants['ops:kyc_analyst']).toContain('ops_kyc.kyc_case.view');
  });

  it('rejects a role that grants an unknown permission', () => {
    const csv =
      'permission_id,app,module,resource_kind,section,action,capability,label,surface\n' +
      'x.y.z,ops,m,r,s,a,visible,L,/x\n';
    expect(() => compileCatalogue(csv, 'ops:r:\n  - nope.nope.nope\n')).toThrow(
      /unknown permission/,
    );
  });

  it('rejects an invalid capability', () => {
    const csv =
      'permission_id,app,module,resource_kind,section,action,capability,label,surface\n' +
      'x.y.z,ops,m,r,s,a,bogus,L,/x\n';
    expect(() => compileCatalogue(csv, '')).toThrow(/invalid capability/);
  });

  it('stays in sync with the committed generated data', () => {
    const compiled = compileCatalogue(read('permission-glossary.csv'), read('roles.yaml'));
    expect(compiled.abilities).toEqual(CATALOGUE);
    expect(compiled.roleGrants).toEqual(ROLE_GRANTS);
  });

  it('resolves the grant set and abilities for a role', () => {
    const catalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };
    const { grants, abilities } = abilitiesForRoles(['ops:kyc_analyst'], catalogue);
    const ids = abilities.map((a) => a.permission_id);

    expect(grants).toContain('ops_kyc.kyc_case.view');
    expect(ids).toContain('ops_kyc.kyc_case.view');
    expect(ids).not.toContain('ops_transfers.transfer.reverse');
  });

  it('unions grants across multiple roles', () => {
    const catalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };
    const { grants } = abilitiesForRoles(['ops:kyc_analyst', 'ops:auditor'], catalogue);
    expect(grants).toContain('ops_audit.audit_entry.view');
    expect(grants).toContain('ops_kyc.kyc_case.view');
  });

  it('returns nothing for unknown roles', () => {
    const catalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };
    expect(abilitiesForRoles(['ops:ghost'], catalogue)).toEqual({ grants: [], abilities: [] });
  });
});
