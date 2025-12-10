import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from './AppError.js';
import { ResponseBuilder } from '../utils/ResponseBuilder.js';

export class ErrorHandler {
  static handle(error: Error | FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) {
    // Log the error
    request.log.error({
      err: error,
      url: request.url,
      method: request.method,
      headers: request.headers,
      body: request.body
    });

    // Handle known AppError instances (NotFoundError, ConflictError, UnauthorizedError, etc.)
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send(
        ResponseBuilder.error(
          error.code || 'ERROR',
          error.message,
          error.details,
          request.url
        )
      );
    }

    // Handle Fastify validation errors (schema validation)
    if ((error as any).validation) {
      return reply.status(400).send(
        ResponseBuilder.error(
          'VALIDATION_ERROR',
          error.message,
          (error as any).validation,
          request.url
        )
      );
    }

    // Handle TypeORM errors
    if (error.name === 'QueryFailedError') {
      return reply.status(400).send(
        ResponseBuilder.error(
          'DATABASE_ERROR',
          'Database operation failed',
          undefined,
          request.url
        )
      );
    }

    // Handle JWT errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return reply.status(401).send(
        ResponseBuilder.error(
          'INVALID_TOKEN',
          error.message,
          undefined,
          request.url
        )
      );
    }

    // Default to 500 for unknown errors
    const statusCode = (error as FastifyError).statusCode || 500;
    return reply.status(statusCode).send(
      ResponseBuilder.error(
        'INTERNAL_SERVER_ERROR',
        process.env.NODE_ENV === 'production' 
          ? 'An unexpected error occurred' 
          : error.message,
        undefined,
        request.url
      )
    );
  }
}
