import { FastifyPluginAsync } from 'fastify';
import { Type } from '@sinclair/typebox';
import { TYPES } from '../../infrastructure/di/types.js';
import { UserController } from '../controllers/UserController.js';
import { authenticateToken } from '../middlewares/authenticate.js';
import { requireRoles } from '../middlewares/authorize.js';
import {
  UserIdParamsSchema,
  UserIdParamsType,
  PaginationQuerySchema,
  PaginationQueryType,
  CreateUserBodySchema,
  CreateUserBodyType,
  UpdateUserBodySchema,
  UpdateUserBodyType,
  UserResponseSchema,
} from '../schemas/user.schema.js';
import {
  SuccessResponseSchema,
  PaginatedResponseSchema,
  CreatedResponseSchema,
  ErrorResponseSchema,
} from '../schemas/shared.schema.js';

const userRoutes: FastifyPluginAsync = async (fastify) => {
  const { diContainer } = fastify;
  const userController = diContainer.get<UserController>(TYPES.UserController);

  // Get all users (Protected - Admin only)
  fastify.get<{ Querystring: PaginationQueryType }>(
    '/',
    {
      preHandler: [authenticateToken, requireRoles('admin')],
      schema: {
        querystring: PaginationQuerySchema,
        response: {
          200: PaginatedResponseSchema(UserResponseSchema),
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
        },
      },
    },
    userController.getAllUsers.bind(userController)
  );

  // Get user by ID (Protected - Admin or Self)
  fastify.get<{ Params: UserIdParamsType }>(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        params: UserIdParamsSchema,
        response: {
          200: SuccessResponseSchema(UserResponseSchema),
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    userController.getUserById.bind(userController)
  );

  // Create user (Protected - Admin only)
  fastify.post<{ Body: CreateUserBodyType }>(
    '/',
    {
      preHandler: [authenticateToken, requireRoles('admin')],
      schema: {
        body: CreateUserBodySchema,
        response: {
          201: CreatedResponseSchema(UserResponseSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          409: ErrorResponseSchema,
        },
      },
    },
    userController.createUser.bind(userController)
  );

  // Update user (Protected - Admin or Self)
  fastify.patch<{ Params: UserIdParamsType; Body: UpdateUserBodyType }>(
    '/:id',
    {
      preHandler: [authenticateToken],
      schema: {
        params: UserIdParamsSchema,
        body: UpdateUserBodySchema,
        response: {
          200: SuccessResponseSchema(UserResponseSchema),
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    userController.updateUser.bind(userController)
  );

  // Delete user (Protected - Admin only)
  fastify.delete<{ Params: UserIdParamsType }>(
    '/:id',
    {
      preHandler: [authenticateToken, requireRoles('admin')],
      schema: {
        params: UserIdParamsSchema,
        response: {
          204: Type.Null(),
          401: ErrorResponseSchema,
          403: ErrorResponseSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    userController.deleteUser.bind(userController)
  );
};

export default userRoutes;
