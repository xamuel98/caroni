import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import type { AbilitiesResponse } from '@caroni/shared-types';
import { correlationId } from '../common/correlation';
import { compileAbilities, type CompiledCatalogue } from './catalogue';
import { CATALOGUE, ROLE_GRANTS } from './catalogue.generated';

/** Mirrors `AbilitiesResponse` in @caroni/shared-types. */
export type AbilitiesPayload = AbilitiesResponse;

/**
 * Turns a session's roles into the grouped ability set the UI consumes.
 * Catalogue/grants are compiled from docs/authz (see `catalogue.generated.ts`).
 */
@Injectable()
export class AbilitiesService {
  private readonly catalogue: CompiledCatalogue = { abilities: CATALOGUE, roleGrants: ROLE_GRANTS };

  forRoles(roles: string[]): AbilitiesPayload {
    const { grants, results } = compileAbilities(roles, this.catalogue);
    return {
      requestId: correlationId() ?? randomUUID(),
      branchScope: [],
      grants,
      results,
    };
  }
}
