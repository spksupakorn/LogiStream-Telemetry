export interface TelemetryData {
  deviceId: string;
  truckId: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
  speed?: number;
  altitude?: number;
}

export class Telemetry {
  readonly deviceId: string;
  readonly truckId: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly temperature: number;
  readonly humidity: number;
  readonly timestamp: Date;
  readonly speed?: number;
  readonly altitude?: number;

  private constructor(data: TelemetryData) {
    this.deviceId = data.deviceId;
    this.truckId = data.truckId;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.temperature = data.temperature;
    this.humidity = data.humidity;
    this.timestamp = data.timestamp;
    this.speed = data.speed;
    this.altitude = data.altitude;
  }

  static create(data: TelemetryData): Telemetry {
    this.validate(data);
    return new Telemetry(data);
  }

  private static validate(data: TelemetryData): void {
    // Device ID validation
    if (!data.deviceId || data.deviceId.trim().length === 0) {
      throw new Error('Device ID is required');
    }

    // Truck ID validation
    if (!data.truckId || data.truckId.trim().length === 0) {
      throw new Error('Truck ID is required');
    }

    // Latitude validation (-90 to 90)
    if (data.latitude < -90 || data.latitude > 90) {
      throw new Error('Latitude must be between -90 and 90 degrees');
    }

    // Longitude validation (-180 to 180)
    if (data.longitude < -180 || data.longitude > 180) {
      throw new Error('Longitude must be between -180 and 180 degrees');
    }

    // Temperature validation (reasonable range for refrigerated trucks: -40°C to 40°C)
    if (data.temperature < -40 || data.temperature > 40) {
      throw new Error('Temperature must be between -40°C and 40°C');
    }

    // Humidity validation (0 to 100%)
    if (data.humidity < 0 || data.humidity > 100) {
      throw new Error('Humidity must be between 0% and 100%');
    }

    // Timestamp validation
    if (!(data.timestamp instanceof Date) || isNaN(data.timestamp.getTime())) {
      throw new Error('Invalid timestamp');
    }

    // Future timestamp check (allow small buffer for clock skew - 1 minute)
    const oneMinuteFromNow = new Date(Date.now() + 60 * 1000);
    if (data.timestamp > oneMinuteFromNow) {
      throw new Error('Timestamp cannot be in the future');
    }

    // Optional speed validation (0 to 200 km/h)
    if (data.speed !== undefined && (data.speed < 0 || data.speed > 200)) {
      throw new Error('Speed must be between 0 and 200 km/h');
    }

    // Optional altitude validation (-500 to 9000 meters)
    if (data.altitude !== undefined && (data.altitude < -500 || data.altitude > 9000)) {
      throw new Error('Altitude must be between -500 and 9000 meters');
    }
  }

  isTemperatureAlert(): boolean {
    // Alert if temperature is outside safe range for refrigerated goods (-20°C to 5°C)
    return this.temperature < -20 || this.temperature > 5;
  }

  isHumidityAlert(): boolean {
    // Alert if humidity is too high (> 80%)
    return this.humidity > 80;
  }

  needsAlert(): boolean {
    return this.isTemperatureAlert() || this.isHumidityAlert();
  }

  toJSON() {
    return {
      deviceId: this.deviceId,
      truckId: this.truckId,
      latitude: this.latitude,
      longitude: this.longitude,
      temperature: this.temperature,
      humidity: this.humidity,
      timestamp: this.timestamp.toISOString(),
      speed: this.speed,
      altitude: this.altitude
    };
  }
}
