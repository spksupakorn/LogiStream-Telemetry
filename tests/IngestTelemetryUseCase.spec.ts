import 'reflect-metadata';
import { IngestTelemetryUseCase } from '../src/application/use-cases/IngestTelemetryUseCase';
import { IngestTelemetryInput } from '../src/application/dtos/telemetry.dto';
import { ITelemetryRepository } from '../src/domain/repositories/ITelemetryRepository';
import { IMessageBus } from '../src/domain/services/IMessageBus';
import { Telemetry } from '../src/domain/entities/Telemetry.entity';
import { AppError } from '../src/shared/errors/AppError';

// Mock implementations
class MockTelemetryRepository implements ITelemetryRepository {
  save = jest.fn();
  findByDeviceId = jest.fn();
  findByTruckId = jest.fn();
  findByTimeRange = jest.fn();
  getLatestByDeviceId = jest.fn();
}

class MockMessageBus implements IMessageBus {
  publishTelemetry = jest.fn();
  connect = jest.fn();
  disconnect = jest.fn();
  isConnected = jest.fn();
}

describe('IngestTelemetryUseCase', () => {
  let useCase: IngestTelemetryUseCase;
  let mockRepository: MockTelemetryRepository;
  let mockMessageBus: MockMessageBus;

  beforeEach(() => {
    mockRepository = new MockTelemetryRepository();
    mockMessageBus = new MockMessageBus();
    
    // Set up default mock returns to prevent undefined errors
    mockRepository.save.mockResolvedValue({} as Telemetry);
    mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
    
    useCase = new IngestTelemetryUseCase(mockRepository, mockMessageBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const validInput: IngestTelemetryInput = {
      deviceId: 'device-001',
      truckId: 'truck-001',
      latitude: 13.7563,
      longitude: 100.5018,
      temperature: -5,
      humidity: 45,
      speed: 60,
      altitude: 50
    };

    it('should successfully ingest valid telemetry data', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      mockRepository.save.mockResolvedValue({} as Telemetry);

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Telemetry data ingested successfully');
      expect(result.telemetry.deviceId).toBe(validInput.deviceId);
      expect(result.telemetry.truckId).toBe(validInput.truckId);
      expect(mockMessageBus.publishTelemetry).toHaveBeenCalledTimes(1);
    });

    it('should publish to Kafka before persisting to database', async () => {
      // Arrange
      const callOrder: string[] = [];
      mockMessageBus.publishTelemetry.mockImplementation(() => {
        callOrder.push('publish');
        return Promise.resolve();
      });
      mockRepository.save.mockImplementation(() => {
        callOrder.push('save');
        return Promise.resolve({} as Telemetry);
      });

      // Act
      await useCase.execute(validInput);

      // Assert
      expect(callOrder[0]).toBe('publish');
      expect(mockMessageBus.publishTelemetry).toHaveBeenCalled();
    });

    it('should use current timestamp if not provided', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      const inputWithoutTimestamp = { ...validInput };
      delete (inputWithoutTimestamp as any).timestamp;

      const beforeExecution = new Date();

      // Act
      const result = await useCase.execute(inputWithoutTimestamp);

      // Assert
      const resultTimestamp = new Date(result.telemetry.timestamp);
      expect(resultTimestamp.getTime()).toBeGreaterThanOrEqual(beforeExecution.getTime());
      expect(resultTimestamp.getTime()).toBeLessThanOrEqual(new Date().getTime());
    });

    it('should accept valid ISO timestamp string', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      const timestamp = new Date('2025-12-18T10:00:00Z').toISOString();
      const inputWithTimestamp = { ...validInput, timestamp };

      // Act
      const result = await useCase.execute(inputWithTimestamp);

      // Assert
      expect(result.success).toBe(true);
      expect(result.telemetry.timestamp).toBe(timestamp);
    });

    it('should detect temperature alerts', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      const highTempInput = { ...validInput, temperature: 10 }; // Above safe range

      // Act
      const result = await useCase.execute(highTempInput);

      // Assert
      expect(result.telemetry.needsAlert).toBe(true);
    });

    it('should detect humidity alerts', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      const highHumidityInput = { ...validInput, humidity: 85 }; // Above 80%

      // Act
      const result = await useCase.execute(highHumidityInput);

      // Assert
      expect(result.telemetry.needsAlert).toBe(true);
    });

    it('should reject invalid device ID', async () => {
      // Arrange
      const invalidInput = { ...validInput, deviceId: '' };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Device ID is required');
    });

    it('should reject invalid latitude', async () => {
      // Arrange
      const invalidInput = { ...validInput, latitude: 100 }; // Out of range

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Latitude must be between -90 and 90 degrees');
    });

    it('should reject invalid longitude', async () => {
      // Arrange
      const invalidInput = { ...validInput, longitude: 200 }; // Out of range

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Longitude must be between -180 and 180 degrees');
    });

    it('should reject invalid temperature', async () => {
      // Arrange
      const invalidInput = { ...validInput, temperature: 50 }; // Out of range

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Temperature must be between -40°C and 40°C');
    });

    it('should reject invalid humidity', async () => {
      // Arrange
      const invalidInput = { ...validInput, humidity: 150 }; // Out of range

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Humidity must be between 0% and 100%');
    });

    it('should reject invalid timestamp format', async () => {
      // Arrange
      const invalidInput = { ...validInput, timestamp: 'invalid-date' };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Invalid timestamp');
    });

    it('should reject future timestamps', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes in future
      const invalidInput = { ...validInput, timestamp: futureDate.toISOString() };

      // Act & Assert
      await expect(useCase.execute(invalidInput)).rejects.toThrow(AppError);
      await expect(useCase.execute(invalidInput)).rejects.toThrow('Timestamp cannot be in the future');
    });

    it('should handle Kafka publish failure', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockRejectedValue(new Error('Kafka connection failed'));

      // Act & Assert
      await expect(useCase.execute(validInput)).rejects.toThrow();
    });

    it('should not fail if database save fails (fire-and-forget)', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Act
      const result = await useCase.execute(validInput);

      // Assert
      expect(result.success).toBe(true);
      // The save failure should be logged but not throw
    });
  });

  describe('executeBatch', () => {
    const validInputs: IngestTelemetryInput[] = [
      {
        deviceId: 'device-001',
        truckId: 'truck-001',
        latitude: 13.7563,
        longitude: 100.5018,
        temperature: -5,
        humidity: 45
      },
      {
        deviceId: 'device-002',
        truckId: 'truck-002',
        latitude: 13.7563,
        longitude: 100.5018,
        temperature: -3,
        humidity: 50
      }
    ];

    it('should successfully ingest batch of valid telemetry data', async () => {
      // Arrange
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);
      mockRepository.save.mockResolvedValue({} as Telemetry);

      // Act
      const result = await useCase.executeBatch(validInputs);

      // Assert
      expect(result.success).toBe(true);
      expect(result.ingested).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should handle partial failures in batch', async () => {
      // Arrange
      const mixedInputs = [
        validInputs[0],
        { ...validInputs[1], latitude: 1000 } // Invalid
      ];
      mockMessageBus.publishTelemetry.mockResolvedValue(undefined);

      // Act
      const result = await useCase.executeBatch(mixedInputs);

      // Assert
      expect(result.success).toBe(true);
      expect(result.ingested).toBe(1);
      expect(result.failed).toBe(1);
    });

    it('should handle empty batch', async () => {
      // Act
      const result = await useCase.executeBatch([]);

      // Assert
      expect(result.success).toBe(true);
      expect(result.ingested).toBe(0);
      expect(result.failed).toBe(0);
    });
  });
});
