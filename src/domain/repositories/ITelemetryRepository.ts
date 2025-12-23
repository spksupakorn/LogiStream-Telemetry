import { Telemetry } from '../entities/Telemetry.entity.js';

export interface ITelemetryRepository {
  /**
   * Save telemetry data to the database
   * @param telemetry - The telemetry entity to save
   * @returns The saved telemetry entity with database ID
   */
  save(telemetry: Telemetry): Promise<Telemetry>;

  /**
   * Find telemetry data by device ID
   * @param deviceId - The device identifier
   * @param limit - Maximum number of records to return
   * @returns Array of telemetry entities
   */
  findByDeviceId(deviceId: string, limit?: number): Promise<Telemetry[]>;

  /**
   * Find telemetry data by truck ID
   * @param truckId - The truck identifier
   * @param limit - Maximum number of records to return
   * @returns Array of telemetry entities
   */
  findByTruckId(truckId: string, limit?: number): Promise<Telemetry[]>;

  /**
   * Find telemetry data within a time range
   * @param startDate - Start of the time range
   * @param endDate - End of the time range
   * @returns Array of telemetry entities
   */
  findByTimeRange(startDate: Date, endDate: Date): Promise<Telemetry[]>;

  /**
   * Get the latest telemetry data for a specific device
   * @param deviceId - The device identifier
   * @returns The latest telemetry entity or null
   */
  getLatestByDeviceId(deviceId: string): Promise<Telemetry | null>;
}
