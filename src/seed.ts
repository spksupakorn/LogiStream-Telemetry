import 'reflect-metadata';
import { createDataSource } from './infrastructure/database/datasource.js';
import { seedDatabase } from './infrastructure/database/seed.js';

async function runSeed() {
  const config = {
    DB_HOST: process.env.DB_HOST || 'localhost',
    DB_PORT: Number(process.env.DB_PORT) || 5432,
    DB_USERNAME: process.env.DB_USERNAME || 'postgres',
    DB_PASSWORD: process.env.DB_PASSWORD || 'postgres',
    DB_DATABASE: process.env.DB_DATABASE || 'logistream',
    DB_SSL: process.env.DB_SSL || 'false',
    NODE_ENV: process.env.NODE_ENV || 'development'
  };

  const dataSource = createDataSource(config);

  try {
    await dataSource.initialize();
    console.log('✅ Database connected');

    await seedDatabase(dataSource);

    await dataSource.destroy();
    console.log('👋 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
