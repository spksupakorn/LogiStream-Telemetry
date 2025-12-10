import { Type, Static } from '@sinclair/typebox';

// ============= Request Schemas =============

// Schema for creating a user (register)
export const CreateUserSchema = Type.Object({
  username: Type.String({ minLength: 3, maxLength: 100 }),
  email: Type.String({ format: 'email' }),
  password: Type.String({ minLength: 6, maxLength: 100 }),
  firstName: Type.Optional(Type.String({ maxLength: 100 })),
  lastName: Type.Optional(Type.String({ maxLength: 100 })),
  roleNames: Type.Optional(Type.Array(Type.String())),
});

export type CreateUserDtoType = Static<typeof CreateUserSchema>;

// Schema for login
export const LoginSchema = Type.Object({
  username: Type.String({ minLength: 1 }),
  password: Type.String({ minLength: 1 }),
});

export type LoginDtoType = Static<typeof LoginSchema>;

// Schema for refresh token
export const RefreshTokenSchema = Type.Object({
  refreshToken: Type.String({ minLength: 1 }),
});

export type RefreshTokenDtoType = Static<typeof RefreshTokenSchema>;

// ============= Response Data Schemas =============

// Auth response data (with tokens) - used inside success wrapper
export const AuthResponseSchema = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  user: Type.Object({
    id: Type.String({ format: 'uuid' }),
    username: Type.String(),
    email: Type.String({ format: 'email' }),
    roles: Type.Array(Type.String()),
  }),
});

export type AuthResponseType = Static<typeof AuthResponseSchema>;