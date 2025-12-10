import { Type, Static } from '@sinclair/typebox';

// ============= Request Schemas =============

// Params schema for user ID
export const UserIdParamsSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
});

export type UserIdParamsType = Static<typeof UserIdParamsSchema>;

// Query schema for pagination
export const PaginationQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 10 })),
});

export type PaginationQueryType = Static<typeof PaginationQuerySchema>;

// Schema for creating a user
export const CreateUserBodySchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6, maxLength: 100 }),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  roleNames: Type.Optional(Type.Array(Type.String())),
});

export type CreateUserBodyType = Static<typeof CreateUserBodySchema>;

// Schema for updating a user
export const UpdateUserBodySchema = Type.Object({
  username: Type.Optional(Type.String({ minLength: 3, maxLength: 100 })),
  email: Type.Optional(Type.String({ format: 'email' })),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  isActive: Type.Optional(Type.Boolean()),
});

export type UpdateUserBodyType = Static<typeof UpdateUserBodySchema>;

// ============= Response Data Schemas =============

// Single user response data (without password) - used inside success wrapper
export const UserResponseSchema = Type.Object({
  id: Type.String({ format: 'uuid' }),
  username: Type.String(),
  email: Type.String({ format: 'email' }),
  firstName: Type.Optional(Type.String()),
  lastName: Type.Optional(Type.String()),
  isActive: Type.Boolean(),
  roles: Type.Array(Type.String()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
});

export type UserResponseType = Static<typeof UserResponseSchema>;