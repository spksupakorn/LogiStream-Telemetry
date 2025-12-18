export interface IngestTelemetryInput {
  deviceId: string;
  truckId: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  timestamp?: string; // ISO string or will use current time
  speed?: number;
  altitude?: number;
}

export interface IngestTelemetryOutput {
  success: boolean;
  message: string;
  telemetry: {
    deviceId: string;
    truckId: string;
    timestamp: string;
    needsAlert: boolean;
  };
}