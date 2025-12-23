import { injectable, inject } from 'inversify';
import { Telemetry, TelemetryData } from '../../domain/entities/Telemetry.entity.js';
import { ITelemetryRepository } from '../../domain/repositories/ITelemetryRepository.js';
import { IMessageBus } from '../../domain/services/IMessageBus.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { AppError } from '../../shared/errors/AppError.js';
import { IngestTelemetryInput, IngestTelemetryOutput } from '../dtos/telemetry.dto.js'

@injectable()
export class IngestTelemetryUseCase {
  constructor(
    @inject(TYPES.ITelemetryRepository)
    private telemetryRepository: ITelemetryRepository,
    @inject(TYPES.IMessageBus)
    private messageBus: IMessageBus
  ) {}

  async execute(input: IngestTelemetryInput): Promise<IngestTelemetryOutput> {
    try {
      // Parse timestamp or use current time
      const timestamp = input.timestamp 
        ? new Date(input.timestamp) 
        : new Date();

      // Validate timestamp
      if (isNaN(timestamp.getTime())) {
        throw new AppError('Invalid timestamp format', 400);
      }

      // Create telemetry data object
      const telemetryData: TelemetryData = {
        deviceId: input.deviceId,
        truckId: input.truckId,
        latitude: input.latitude,
        longitude: input.longitude,
        temperature: input.temperature,
        humidity: input.humidity,
        timestamp,
        speed: input.speed,
        altitude: input.altitude
      };

      // Create and validate telemetry entity (domain validation)
      const telemetry = Telemetry.create(telemetryData);

      // Fire-and-Forget Pattern:
      // 1. Publish to Kafka first (fast, non-blocking)
      // 2. Persist to database asynchronously (can be handled by consumer)
      
      // Publish to message bus (Kafka) - this is the primary action
      await this.messageBus.publishTelemetry(telemetry);

      // Optional: Persist to database for immediate querying
      // In a true fire-and-forget pattern, this could be handled by a separate consumer
      // For this implementation, we'll do it here but could be moved to async worker
      this.telemetryRepository.save(telemetry).catch(error => {
        // Log error but don't fail the request - this is fire-and-forget
        console.error('Failed to persist telemetry to database:', error);
      });

      return {
        success: true,
        message: 'Telemetry data ingested successfully',
        telemetry: {
          deviceId: telemetry.deviceId,
          truckId: telemetry.truckId,
          timestamp: telemetry.timestamp.toISOString(),
          needsAlert: telemetry.needsAlert()
        }
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      if (error instanceof Error) {
        // Domain validation errors
        throw new AppError(error.message, 400);
      }

      throw new AppError('Failed to ingest telemetry data', 500);
    }
  }

  /**
   * Batch ingest for high-throughput scenarios
   */
  async executeBatch(inputs: IngestTelemetryInput[]): Promise<{
    success: boolean;
    message: string;
    ingested: number;
    failed: number;
  }> {
    const telemetries: Telemetry[] = [];
    let failedCount = 0;

    // Validate and create all telemetry entities
    for (const input of inputs) {
      try {
        const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();
        
        const telemetryData: TelemetryData = {
          deviceId: input.deviceId,
          truckId: input.truckId,
          latitude: input.latitude,
          longitude: input.longitude,
          temperature: input.temperature,
          humidity: input.humidity,
          timestamp,
          speed: input.speed,
          altitude: input.altitude
        };

        const telemetry = Telemetry.create(telemetryData);
        telemetries.push(telemetry);
      } catch (error) {
        failedCount++;
        console.error('Failed to create telemetry entity:', error);
      }
    }

    // Publish batch to Kafka
    if (telemetries.length > 0) {
      // Check if messageBus has publishBatch method
      if ('publishBatch' in this.messageBus && typeof (this.messageBus as any).publishBatch === 'function') {
        await (this.messageBus as any).publishBatch(telemetries);
      } else {
        // Fallback to individual publish
        await Promise.all(telemetries.map(t => this.messageBus.publishTelemetry(t)));
      }

      // Persist to database asynchronously (fire-and-forget)
      Promise.all(telemetries.map(t => this.telemetryRepository.save(t))).catch(error => {
        console.error('Failed to persist batch telemetry to database:', error);
      });
    }

    return {
      success: true,
      message: 'Batch telemetry ingestion completed',
      ingested: telemetries.length,
      failed: failedCount
    };
  }
}
