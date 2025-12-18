import { FastifyPluginAsync } from 'fastify';
import { TYPES } from '../../infrastructure/di/types.js';
import { TelemetryController } from '../controllers/TelemetryController.js';
import {
  TelemetryInputSchema,
  TelemetryInput,
  BatchTelemetryInputSchema,
  BatchTelemetryInput,
  IngestResponseSchema,
  BatchIngestResponseSchema,
  HealthResponseSchema
} from '../schemas/telemetry.schema.js';
import { SuccessResponseSchema, ErrorResponseSchema } from '../schemas/shared.schema.js';

const telemetryRoutes: FastifyPluginAsync = async (fastify) => {
  const { diContainer } = fastify;
  const controller = diContainer.get<TelemetryController>(TYPES.TelemetryController);

  // POST /api/v1/telemetry - Ingest single telemetry event
  fastify.post<{ Body: TelemetryInput }>(
    '/',
    {
      schema: {
        description: 'Ingest single telemetry event from IoT device',
        tags: ['Telemetry'],
        body: TelemetryInputSchema,
        response: {
            202: SuccessResponseSchema(IngestResponseSchema),
            400: ErrorResponseSchema,
            500: ErrorResponseSchema
        }
      }
    },
    controller.ingest.bind(controller)
  );

  // POST /api/v1/telemetry/batch - Ingest batch of telemetry events
  fastify.post<{ Body: BatchTelemetryInput }>(
    '/batch',
    {
      schema: {
        description: 'Ingest batch of telemetry events for high-throughput scenarios',
        tags: ['Telemetry'],
        body: BatchTelemetryInputSchema,
        response: {
          202: SuccessResponseSchema(BatchIngestResponseSchema),
          400: ErrorResponseSchema,
          500: ErrorResponseSchema
        }
      }
    },
    controller.ingestBatch.bind(controller)
  );

  // GET /api/v1/telemetry/health - Health check
  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check for telemetry ingestion service',
        tags: ['Telemetry'],
        response: {
          200: SuccessResponseSchema(HealthResponseSchema)
        }
      }
    },
    controller.health.bind(controller)
  );
};

export default telemetryRoutes;

// export default async function telemetryRoutes(
//   fastify: FastifyInstance,
//   opts: FastifyPluginOptions
// ): Promise<void> {
//   const controller = fastify.diContainer.get<TelemetryController>(TYPES.TelemetryController);

//   // POST /api/v1/telemetry - Ingest single telemetry event
//   fastify.post(
//     '/',
//     {
//       schema: {
//         description: 'Ingest single telemetry event from IoT device',
//         tags: ['Telemetry'],
//         body: TelemetryInputSchema,
//         response: {
//           202: SuccessResponseSchema(IngestResponseSchema),
//           400: ErrorResponseSchema,
//           500: ErrorResponseSchema
//         }
//       }
//     },
//     controller.ingest.bind(controller)
//   );

//   // POST /api/v1/telemetry/batch - Ingest batch of telemetry events
//   fastify.post(
//     '/batch',
//     {
//       schema: {
//         description: 'Ingest batch of telemetry events for high-throughput scenarios',
//         tags: ['Telemetry'],
//         body: BatchTelemetryInputSchema,
//         response: {
//           202: SuccessResponseSchema(BatchIngestResponseSchema),
//           400: ErrorResponseSchema,
//           500: ErrorResponseSchema
//         }
//       }
//     },
//     controller.ingestBatch.bind(controller)
//   );

//   // GET /api/v1/telemetry/health - Health check
//   fastify.get(
//     '/health',
//     {
//       schema: {
//         description: 'Health check for telemetry ingestion service',
//         tags: ['Telemetry'],
//         response: {
//           200: SuccessResponseSchema(HealthResponseSchema)
//         }
//       }
//     },
//     controller.health.bind(controller)
//   );
// }
