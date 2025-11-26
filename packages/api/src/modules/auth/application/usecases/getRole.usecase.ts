/**
 * @file getRole.usecase.ts
 * @module Auth/Application/UseCases
 * @layer Application
 * @description Get Role Use Case - Retrieve user roles
 */

import { IRoleRepository } from '../../domain/repositories/IRoleRepository';
import { Role } from '../../domain/role.entity';

export interface GetRoleDTO {
  userId: string;
}

export class GetRoleUseCase {
  constructor(private readonly roleRepository: IRoleRepository) {}

  async execute(dto: GetRoleDTO): Promise<Role[]> {
    const roles = await this.roleRepository.findByUserId(dto.userId);
    return roles;
  }
}
