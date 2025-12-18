import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { IngestTelemetryUseCase } from '../../application/use-cases/IngestTelemetryUseCase.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { ResponseBuilder } from '../../shared/utils/ResponseBuilder.js';
import { AppError } from '../../shared/errors/AppError.js';
import { TelemetryInput } from '../schemas/telemetry.schema.js';

@injectable()
export class TelemetryController {
  constructor(
    @inject(TYPES.IngestTelemetryUseCase)
    private ingestTelemetryUseCase: IngestTelemetryUseCase
  ) {}

  /**
   * Ingest single telemetry event
   * POST /api/v1/telemetry
   */
  async ingest(
    request: FastifyRequest<{ Body: TelemetryInput }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const result = await this.ingestTelemetryUseCase.execute(request.body);
      
      reply
        .code(202) // Accepted - indicates async processing
        .send(ResponseBuilder.success(result));
    } catch (error) {
      if (error instanceof AppError) {
        reply
          .code(error.statusCode)
          .send(ResponseBuilder.error('VALIDATION_ERROR', error.message));
      } else {
        reply
          .code(500)
          .send(ResponseBuilder.error('INTERNAL_ERROR', 'Internal server error'));
      }
    }
  }

  /**
   * Ingest batch of telemetry events
   * POST /api/v1/telemetry/batch
   */
  async ingestBatch(
    request: FastifyRequest<{ Body: { telemetry: TelemetryInput[] } }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const { telemetry } = request.body;

      if (!Array.isArray(telemetry) || telemetry.length === 0) {
        throw new AppError('Telemetry array is required and cannot be empty', 400);
      }

      if (telemetry.length > 1000) {
        throw new AppError('Batch size cannot exceed 1000 items', 400);
      }

      const result = await this.ingestTelemetryUseCase.executeBatch(telemetry);
      
      reply
        .code(202) // Accepted
        .send(ResponseBuilder.success(result));
    } catch (error) {
      if (error instanceof AppError) {
        reply
          .code(error.statusCode)
          .send(ResponseBuilder.error('BATCH_ERROR', error.message));
      } else {
        reply
          .code(500)
          .send(ResponseBuilder.error('INTERNAL_ERROR', 'Internal server error'));
      }
    }
  }

  /**
   * Health check endpoint for telemetry service
   * GET /api/v1/telemetry/health
   */
  async health(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    reply
      .code(200)
      .send(
        ResponseBuilder.success({
          status: 'healthy',
          service: 'telemetry-ingestion',
          timestamp: new Date().toISOString()
        })
      );
  }
}
