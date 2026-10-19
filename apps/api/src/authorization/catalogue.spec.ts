import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { compileAbilities, compileCatalogue, parseGlossaryCsv, parseRolesYaml } from './catalogue';
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

  it('rejects two entries sharing a resource action', () => {
    const csv =
      'permission_id,app,module,resource_kind,section,action,capability,label,surface\n' +
      'm.r.view,ops,m,r,s,view,visible,View,/r\n' +
      'm.r.preview,ops,m,r,s,view,visible,Preview,/r\n';
    expect(() => compileCatalogue(csv, '')).toThrow(/duplicate action/);
  });

  it('stays in sync with the committed generated data', () => {
    const compiled = compileCatalogue(read('permission-glossary.csv'), read('roles.yaml'));
    expect(compiled.abilities).toEqual(CATALOGUE);
    expect(compiled.roleGrants).toEqual(ROLE_GRANTS);
  });

  it('groups granted abilities into resources with per-action decisions', () => {
    const catalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };
    const { grants, results } = compileAbilities(['ops:kyc_analyst'], catalogue);

    expect(grants).toContain('ops_kyc.kyc_case.view');

    const kycCase = results.find(
      (r) => r.resource.module === 'ops_kyc' && r.resource.kind === 'kyc_case',
    );
    expect(kycCase?.resource.app).toBe('ops');
    expect(kycCase?.actions.view).toMatchObject({
      effect: 'EFFECT_ALLOW',
      mode: 'show',
      permissionId: 'ops_kyc.kyc_case.view',
    });
  });

  it('reports denied sibling actions and omits resources with no grant', () => {
    const csv =
      'permission_id,app,module,resource_kind,section,action,capability,label,surface\n' +
      'm.r.view,ops,m,r,s,view,visible,View,/r\n' +
      'm.r.reverse,ops,m,r,s,reverse,actionable,Reverse,/r/:id\n' +
      'other.x.view,ops,other,x,s,view,visible,Other,/x\n';
    const catalogue = compileCatalogue(csv, 'ops:r:\n  - m.r.view\n');
    const { results } = compileAbilities(['ops:r'], catalogue);

    const resource = results.find((r) => r.resource.module === 'm');
    expect(resource?.actions.view).toMatchObject({ effect: 'EFFECT_ALLOW', mode: 'show' });
    expect(resource?.actions.reverse).toMatchObject({ effect: 'EFFECT_DENY', mode: 'hide' });
    expect(resource?.actions.reverse?.reason).toMatch(/does not grant/);
    expect(results.some((r) => r.resource.module === 'other')).toBe(false);
  });

  it('unions grants across multiple roles', () => {
    const catalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };
    const { grants } = compileAbilities(['ops:kyc_analyst', 'ops:auditor'], catalogue);
    expect(grants).toContain('ops_audit.audit_entry.view');
    expect(grants).toContain('ops_kyc.kyc_case.view');
  });

  it('returns nothing for unknown roles', () => {
    const catalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };
    expect(compileAbilities(['ops:ghost'], catalogue)).toEqual({ grants: [], results: [] });
  });
});
