import { Type, Static } from '@sinclair/typebox';

// Telemetry input schema
export const TelemetryInputSchema = Type.Object({
  deviceId: Type.String({ 
    minLength: 1, 
    description: 'Unique device identifier' 
  }),
  truckId: Type.String({ 
    minLength: 1, 
    description: 'Truck identifier' 
  }),
  latitude: Type.Number({ 
    minimum: -90, 
    maximum: 90, 
    description: 'GPS latitude (-90 to 90)' 
  }),
  longitude: Type.Number({ 
    minimum: -180, 
    maximum: 180, 
    description: 'GPS longitude (-180 to 180)' 
  }),
  temperature: Type.Number({ 
    minimum: -40, 
    maximum: 40, 
    description: 'Temperature in Celsius (-40 to 40)' 
  }),
  humidity: Type.Number({ 
    minimum: 0, 
    maximum: 100, 
    description: 'Humidity percentage (0 to 100)' 
  }),
  timestamp: Type.Optional(
    Type.String({ 
      format: 'date-time', 
      description: 'ISO 8601 timestamp (optional, defaults to current time)' 
    })
  ),
  speed: Type.Optional(
    Type.Number({ 
      minimum: 0, 
      maximum: 200, 
      description: 'Speed in km/h (0 to 200)' 
    })
  ),
  altitude: Type.Optional(
    Type.Number({ 
      minimum: -500, 
      maximum: 9000, 
      description: 'Altitude in meters (-500 to 9000)' 
    })
  )
});

// Batch telemetry input schema
export const BatchTelemetryInputSchema = Type.Object({
  telemetry: Type.Array(TelemetryInputSchema, {
    minItems: 1,
    maxItems: 1000,
    description: 'Array of telemetry data (1-1000 items)'
  })
});

// Telemetry response schema
export const TelemetryResponseSchema = Type.Object({
  deviceId: Type.String(),
  truckId: Type.String(),
  timestamp: Type.String({ format: 'date-time' }),
  needsAlert: Type.Boolean()
});

// Ingest response schema
export const IngestResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  telemetry: TelemetryResponseSchema
});

// Batch ingest response schema
export const BatchIngestResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.String(),
  ingested: Type.Number(),
  failed: Type.Number()
});

// Health response schema
export const HealthResponseSchema = Type.Object({
  status: Type.String(),
  service: Type.String(),
  timestamp: Type.String({ format: 'date-time' })
});

// Type exports
export type TelemetryInput = Static<typeof TelemetryInputSchema>;
export type BatchTelemetryInput = Static<typeof BatchTelemetryInputSchema>;
export type TelemetryResponse = Static<typeof TelemetryResponseSchema>;
export type IngestResponse = Static<typeof IngestResponseSchema>;
export type BatchIngestResponse = Static<typeof BatchIngestResponseSchema>;
export type HealthResponse = Static<typeof HealthResponseSchema>;
