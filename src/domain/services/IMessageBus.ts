import { Telemetry } from '../../domain/entities/Telemetry.entity.js';

export interface IMessageBus {
  /**
   * Publish a telemetry event to the message bus
   * @param telemetry - The telemetry entity to publish
   * @returns Promise that resolves when message is sent
   */
  publishTelemetry(telemetry: Telemetry): Promise<void>;

  /**
   * Connect to the message bus
   */
  connect(): Promise<void>;

  /**
   * Disconnect from the message bus
   */
  disconnect(): Promise<void>;

  /**
   * Check if the message bus is connected
   */
  isConnected(): boolean;
}
