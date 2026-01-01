/**
 * @file group.dto.ts
 * @module Chat/Interfaces/DTO
 * @layer Interface
 * @description Group Chat DTOs with Zod validation
 */

import { z } from 'zod';

export const CreateGroupDtoSchema = z.object({
  name: z.string()
    .min(1, 'Group name is required')
    .max(100, 'Group name is too long')
    .trim(),
  participantIds: z.array(z.string().uuid('Invalid participant ID'))
    .min(2, 'Group must have at least 2 participants besides creator'),
});

export const AddGroupMemberDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export const RemoveGroupMemberDtoSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type CreateGroupDto = z.infer<typeof CreateGroupDtoSchema>;
export type AddGroupMemberDto = z.infer<typeof AddGroupMemberDtoSchema>;
export type RemoveGroupMemberDto = z.infer<typeof RemoveGroupMemberDtoSchema>;
