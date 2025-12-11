import { FastifyPluginAsync } from 'fastify';
import { TYPES } from '../../infrastructure/di/types.js';
import { AuthController } from '../controllers/AuthController.js';
import {
  CreateUserSchema,
  CreateUserDtoType,
  LoginSchema,
  LoginDtoType,
  RefreshTokenSchema,
  RefreshTokenDtoType,
  AuthResponseSchema,
} from '../schemas/auth.schema.js';
import { UserResponseSchema } from '../schemas/user.schema.js';
import {
  SuccessResponseSchema,
  CreatedResponseSchema,
  ErrorResponseSchema,
} from '../schemas/shared.schema.js';

const authRoutes: FastifyPluginAsync = async (fastify) => {
  const { diContainer } = fastify;
  const authController = diContainer.get<AuthController>(TYPES.AuthController);

  // Register (Public)
  fastify.post<{ Body: CreateUserDtoType }>(
    '/register',
    {
      schema: {
        tags: ['auth'],
        description: 'Register a new user',
        body: CreateUserSchema,
        response: {
          201: CreatedResponseSchema(UserResponseSchema),
          400: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    authController.register.bind(authController)
  );

  // Login (Public)
  fastify.post<{ Body: LoginDtoType }>(
    '/login',
    {
      schema: {
        tags: ['auth'],
        description: 'Login with username/email and password',
        body: LoginSchema,
        response: {
          200: SuccessResponseSchema(AuthResponseSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    authController.login.bind(authController)
  );

  // Refresh Token (Public - but requires refresh token)
  fastify.post<{ Body: RefreshTokenDtoType }>(
    '/refresh',
    {
      schema: {
        tags: ['auth'],
        description: 'Refresh access token using refresh token',
        body: RefreshTokenSchema,
        response: {
          200: SuccessResponseSchema(AuthResponseSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    authController.refreshToken.bind(authController)
  );
};

export default authRoutes;
