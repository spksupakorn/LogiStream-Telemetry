import { injectable, inject } from 'inversify';
import { Kafka, Producer, logLevel } from 'kafkajs';
import { IMessageBus } from '../../domain/services/IMessageBus.js';
import { Telemetry } from '../../domain/entities/Telemetry.entity.js';
import { TYPES } from '../di/types.js';
import { IConfigService } from '../config/ConfigService.js';

@injectable()
export class KafkaMessageBus implements IMessageBus {
  private kafka: Kafka;
  private producer: Producer;
  private connected: boolean = false;
  private readonly topic: string = 'telemetry-events';

  constructor(
    @inject(TYPES.IConfigService) private configService: IConfigService
  ) {
    const kafkaBrokers = this.configService.get<string>('KAFKA_BROKERS') || 'localhost:29092';
    const clientId = this.configService.get<string>('KAFKA_CLIENT_ID') || 'logistream-telemetry';

    this.kafka = new Kafka({
      clientId,
      brokers: kafkaBrokers.split(','),
      logLevel: logLevel.INFO,
      retry: {
        initialRetryTime: 300,
        retries: 10
      }
    });

    this.producer = this.kafka.producer({
      allowAutoTopicCreation: true,
      transactionTimeout: 30000
    });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      await this.producer.connect();
      this.connected = true;
      console.log('Kafka producer connected successfully');
    } catch (error) {
      console.error('Failed to connect Kafka producer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.producer.disconnect();
      this.connected = false;
      console.log('Kafka producer disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect Kafka producer:', error);
      throw error;
    }
  }

  isConnected(): boolean {
    return this.connected;
  }

  async publishTelemetry(telemetry: Telemetry): Promise<void> {
    if (!this.connected) {
      throw new Error('Kafka producer is not connected');
    }

    try {
      const message = {
        key: telemetry.deviceId, // Use deviceId as partition key for ordering
        value: JSON.stringify(telemetry.toJSON()),
        headers: {
          'event-type': 'telemetry-ingested',
          'device-id': telemetry.deviceId,
          'truck-id': telemetry.truckId,
          'timestamp': telemetry.timestamp.toISOString(),
          'needs-alert': telemetry.needsAlert().toString()
        }
      };

      await this.producer.send({
        topic: this.topic,
        messages: [message]
      });

      console.log(`Telemetry published to Kafka: Device ${telemetry.deviceId}`);
    } catch (error) {
      console.error('Failed to publish telemetry to Kafka:', error);
      throw error;
    }
  }

  /**
   * Publish multiple telemetry events in a batch for better throughput
   */
  async publishBatch(telemetries: Telemetry[]): Promise<void> {
    if (!this.connected) {
      throw new Error('Kafka producer is not connected');
    }

    try {
      const messages = telemetries.map(telemetry => ({
        key: telemetry.deviceId,
        value: JSON.stringify(telemetry.toJSON()),
        headers: {
          'event-type': 'telemetry-ingested',
          'device-id': telemetry.deviceId,
          'truck-id': telemetry.truckId,
          'timestamp': telemetry.timestamp.toISOString(),
          'needs-alert': telemetry.needsAlert().toString()
        }
      }));

      await this.producer.send({
        topic: this.topic,
        messages
      });

      console.log(`Batch of ${telemetries.length} telemetry events published to Kafka`);
    } catch (error) {
      console.error('Failed to publish telemetry batch to Kafka:', error);
      throw error;
    }
  }
}
