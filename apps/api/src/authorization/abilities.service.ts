import { Injectable } from '@nestjs/common';
import type { Ability } from '@caroni/shared-types';
import { abilitiesForRoles, type CompiledCatalogue } from './catalogue';
import { CATALOGUE, ROLE_GRANTS } from './catalogue.generated';

/** Mirrors `AbilitiesResponse` in @caroni/shared-types. */
export interface AbilitiesPayload {
  abilities: Ability[];
  grants: string[];
  obligations: Record<string, unknown>;
  branchScope: string[];
}

/**
 * Turns a session's roles into the structured ability set the UI consumes.
 * Catalogue/grants are compiled from docs/authz (see `catalogue.generated.ts`).
 */
@Injectable()
export class AbilitiesService {
  private readonly catalogue: CompiledCatalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };

  forRoles(roles: string[]): AbilitiesPayload {
    const { grants, abilities } = abilitiesForRoles(roles, this.catalogue);
    return { abilities, grants, obligations: {}, branchScope: [] };
  }
}
