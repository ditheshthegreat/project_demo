/**
 * @file roleRepositoryImpl.ts
 * @module Auth/Infrastructure/Database
 * @layer Infrastructure
 * @description Role Repository Implementation - Prisma
 */

import { prisma } from '../../../../shared/infra/prisma/prismaClient';
import { Role } from '../../domain/role.entity';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository';

export class RoleRepositoryImpl implements IRoleRepository {
  async findByUserId(userId: string): Promise<Role[]> {
    const roles = await prisma.role.findMany({
      where: { userId },
    });

    return roles.map((r) =>
      Role.create(r.id, r.name, r.userId, r.createdAt)
    );
  }

  async create(userId: string, roleName: string): Promise<Role> {
    const role = await prisma.role.create({
      data: {
        userId,
        name: roleName.toLowerCase(),
      },
    });

    return Role.create(role.id, role.name, role.userId, role.createdAt);
  }

  async delete(roleId: string): Promise<void> {
    await prisma.role.delete({
      where: { id: roleId },
    });
  }

  async hasRole(userId: string, roleName: string): Promise<boolean> {
    const role = await prisma.role.findFirst({
      where: {
        userId,
        name: roleName.toLowerCase(),
      },
    });

    return role !== null;
  }
}
