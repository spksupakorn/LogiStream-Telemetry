import { DataSource } from 'typeorm';
import { User } from '../../domain/entities/User.entity.js';
import { Role } from '../../domain/entities/Role.entity.js';
import { Permission } from '../../domain/entities/Permission.entity.js';

export const createDataSource = (config: any): DataSource => {
  return new DataSource({
    type: 'postgres',
    host: config.DB_HOST,
    port: config.DB_PORT,
    username: config.DB_USERNAME,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    entities: [User, Role, Permission],
    synchronize: config.NODE_ENV === 'development', // Only in dev!
    logging: config.NODE_ENV === 'development',
    ssl: config.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
};
