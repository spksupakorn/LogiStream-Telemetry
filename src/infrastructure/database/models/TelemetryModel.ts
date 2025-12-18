import mongoose, { Schema, Document } from 'mongoose';

export interface ITelemetryDocument extends Document {
  deviceId: string;
  truckId: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  timestamp: Date;
  speed?: number;
  altitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

const TelemetrySchema = new Schema<ITelemetryDocument>(
  {
    deviceId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    truckId: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    },
    temperature: {
      type: Number,
      required: true,
      min: -40,
      max: 40
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    timestamp: {
      type: Date,
      required: true,
      index: true
    },
    speed: {
      type: Number,
      min: 0,
      max: 200
    },
    altitude: {
      type: Number,
      min: -500,
      max: 9000
    }
  },
  {
    timestamps: true,
    collection: 'telemetry'
  }
);

// Compound indexes for efficient queries
TelemetrySchema.index({ deviceId: 1, timestamp: -1 });
TelemetrySchema.index({ truckId: 1, timestamp: -1 });
TelemetrySchema.index({ timestamp: -1 });

// Time-series collection optimization for MongoDB 5.0+
// Note: To use time-series collections, you need to create the collection manually
// with timeseries options BEFORE creating the model, or use the method below.

// Method 1: Create model with time-series options (MongoDB 5.0+)
// Uncomment this and comment out the regular model below to enable time-series
/*
export const TelemetryModel = mongoose.model<ITelemetryDocument>(
  'Telemetry',
  TelemetrySchema,
  'telemetry', // collection name
  {
    timeseries: {
      timeField: 'timestamp',      // The field that contains the time
      metaField: 'deviceId',       // Field to group documents (optional but recommended)
      granularity: 'seconds'       // 'seconds', 'minutes', or 'hours'
    },
    expireAfterSeconds: 31536000  // Optional: Auto-delete after 1 year (365 days)
  }
);
*/

// Method 2: Regular collection (default - works with all MongoDB versions)
export const TelemetryModel = mongoose.model<ITelemetryDocument>(
  'Telemetry',
  TelemetrySchema
);
