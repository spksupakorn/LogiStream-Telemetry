import { injectable } from 'inversify';
import { Telemetry, TelemetryData } from '../../domain/entities/Telemetry.entity.js';
import { ITelemetryRepository } from '../../domain/repositories/ITelemetryRepository.js';
import { TelemetryModel, ITelemetryDocument } from '../database/models/TelemetryModel.js';

@injectable()
export class TelemetryRepository implements ITelemetryRepository {
  async save(telemetry: Telemetry): Promise<Telemetry> {
    const document = new TelemetryModel({
      deviceId: telemetry.deviceId,
      truckId: telemetry.truckId,
      latitude: telemetry.latitude,
      longitude: telemetry.longitude,
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      timestamp: telemetry.timestamp,
      speed: telemetry.speed,
      altitude: telemetry.altitude
    });

    await document.save();
    return this.mapToEntity(document);
  }

  async findByDeviceId(deviceId: string, limit: number = 100): Promise<Telemetry[]> {
    const documents = await TelemetryModel
      .find({ deviceId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return documents.map((doc: ITelemetryDocument) => this.mapToEntity(doc));
  }

  async findByTruckId(truckId: string, limit: number = 100): Promise<Telemetry[]> {
    const documents = await TelemetryModel
      .find({ truckId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();

    return documents.map((doc: ITelemetryDocument) => this.mapToEntity(doc));
  }

  async findByTimeRange(startDate: Date, endDate: Date): Promise<Telemetry[]> {
    const documents = await TelemetryModel
      .find({
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ timestamp: -1 })
      .exec();

    return documents.map((doc: ITelemetryDocument) => this.mapToEntity(doc));
  }

  async getLatestByDeviceId(deviceId: string): Promise<Telemetry | null> {
    const document = await TelemetryModel
      .findOne({ deviceId })
      .sort({ timestamp: -1 })
      .exec();

    return document ? this.mapToEntity(document) : null;
  }

  private mapToEntity(document: ITelemetryDocument): Telemetry {
    const data: TelemetryData = {
      deviceId: document.deviceId,
      truckId: document.truckId,
      latitude: document.latitude,
      longitude: document.longitude,
      temperature: document.temperature,
      humidity: document.humidity,
      timestamp: document.timestamp,
      speed: document.speed,
      altitude: document.altitude
    };

    return Telemetry.create(data);
  }
}
