import { FastifyRequest, FastifyReply } from 'fastify';
import { ForbiddenError, UnauthorizedError } from '../../shared/errors/index.js';

export const requireRoles = (...roles: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const userRoles = request.user.roles || [];
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      throw new ForbiddenError(`Required roles: ${roles.join(', ')}`);
    }
  };
};

export const requirePermissions = (...permissions: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const userPermissions = request.user.permissions || [];
    const hasPermission = permissions.every(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      throw new ForbiddenError(`Required permissions: ${permissions.join(', ')}`);
    }
  };
};

// Check if user has ANY of the specified permissions
export const requireAnyPermission = (...permissions: string[]) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      throw new UnauthorizedError('User not authenticated');
    }

    const userPermissions = request.user.permissions || [];
    const hasPermission = permissions.some(perm => userPermissions.includes(perm));

    if (!hasPermission) {
      throw new ForbiddenError(`Required any of: ${permissions.join(', ')}`);
    }
  };
};
