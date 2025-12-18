// import mongoose from 'mongoose'; 

// /**
//  * Initialize MongoDB Time-Series Collection for Telemetry Data
//  * 
//  * This script creates a time-series collection optimized for telemetry data.
//  * Run this ONCE before starting your application to enable time-series features.
//  * 
//  * Requirements: MongoDB 5.0+
//  * 
//  * Usage:
//  *   tsx src/infrastructure/database/initTimeSeries.ts
//  */

// async function initializeTimeSeriesCollection() {
//   try {
//     const mongoUri = process.env.MONGO_URI || 'mongodb://admin:admin123@localhost:27017/telemetry?authSource=admin';
    
//     console.log('Connecting to MongoDB...');
//     await mongoose.connect(mongoUri);
    
//     const db = mongoose.connection.db;
    
//     // Check if collection already exists
//     const collections = await db.listCollections({ name: 'telemetry' }).toArray();
    
//     if (collections.length > 0) {
//       console.log('⚠️  Collection "telemetry" already exists.');
//       console.log('To convert to time-series collection:');
//       console.log('1. Drop the existing collection: db.telemetry.drop()');
//       console.log('2. Re-run this script');
//       console.log('\nOr use the regular collection (it will still work fine with indexes)');
//       await mongoose.connection.close();
//       return;
//     }
    
//     console.log('Creating time-series collection...');
    
//     // Create time-series collection
//     await db.createCollection('telemetry', {
//       timeseries: {
//         timeField: 'timestamp',           // The field that contains the timestamp
//         metaField: 'deviceId',            // Field to group related time-series data
//         granularity: 'seconds'            // Expected time between measurements
//       },
//       expireAfterSeconds: 31536000,       // Auto-delete data after 1 year (optional)
//     });
    
//     console.log('✅ Time-series collection "telemetry" created successfully!');
//     console.log('\nTime-series configuration:');
//     console.log('  - Time Field: timestamp');
//     console.log('  - Meta Field: deviceId');
//     console.log('  - Granularity: seconds');
//     console.log('  - Data Expiration: 365 days');
//     console.log('\nBenefits:');
//     console.log('  ✓ Optimized storage (compressed time-series data)');
//     console.log('  ✓ Faster time-range queries');
//     console.log('  ✓ Automatic data retention (expires after 1 year)');
//     console.log('  ✓ Better performance for IoT use cases');
    
//     // Create indexes on the time-series collection
//     console.log('\nCreating indexes...');
//     const collection = db.collection('telemetry');
    
//     await collection.createIndex({ truckId: 1, timestamp: -1 });
//     console.log('✅ Index created: { truckId: 1, timestamp: -1 }');
    
//     await collection.createIndex({ deviceId: 1, timestamp: -1 });
//     console.log('✅ Index created: { deviceId: 1, timestamp: -1 }');
    
//     console.log('\n🎉 Time-series collection is ready to use!');
//     console.log('You can now start your application with optimized telemetry storage.');
    
//   } catch (error) {
//     if (error instanceof Error) {
//       console.error('❌ Error:', error.message);
      
//       if (error.message.includes('not supported')) {
//         console.error('\n⚠️  Time-series collections require MongoDB 5.0 or higher.');
//         console.error('Current MongoDB version is too old.');
//         console.error('You can still use the regular collection with indexes.');
//       }
//     } else {
//       console.error('❌ Error:', error);
//     }
//   } finally {
//     await mongoose.connection.close();
//     console.log('\nMongoDB connection closed.');
//   }
// }

// // Run the initialization
// initializeTimeSeriesCollection();
