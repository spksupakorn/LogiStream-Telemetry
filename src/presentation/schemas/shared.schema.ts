import { Type, TSchema } from '@sinclair/typebox';

/**
 * Generic success response wrapper for 200 OK.
 * @param dataSchema The TypeBox schema for the 'data' property.
 */
export const SuccessResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    data: dataSchema,
    timestamp: Type.String({ format: 'date-time' }),
  });

/**
 * Generic created response wrapper for 201 Created.
 * @param dataSchema The TypeBox schema for the 'data' property.
 */
export const CreatedResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    data: dataSchema,
    timestamp: Type.String({ format: 'date-time' }),
  });

/**
 * Standard error response schema.
 */
export const ErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.String(),
    message: Type.String(),
    details: Type.Optional(Type.Any()),
  }),
  timestamp: Type.String({ format: 'date-time' }),
});

/**
 * Standard not found error response schema.
 */
export const NotFoundErrorSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.Object({
    code: Type.Literal('NOT_FOUND'),
    message: Type.String(),
  }),
  timestamp: Type.String({ format: 'date-time' }),
});

/**
 * Paginated response wrapper for list endpoints.
 * @param dataSchema The TypeBox schema for the items in the 'data' array.
 */
export const PaginatedResponseSchema = <T extends TSchema>(dataSchema: T) =>
  Type.Object({
    success: Type.Literal(true),
    data: Type.Array(dataSchema),
    meta: Type.Object({
      page: Type.Number(),
      limit: Type.Number(),
      total: Type.Number(),
      totalPages: Type.Number(),
    }),
    timestamp: Type.String({ format: 'date-time' }),
  });