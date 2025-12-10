import { injectable } from 'inversify';

export interface IConfigService {
  get<T = string>(key: string): T;
  getJwtSecret(): string;
  getJwtRefreshSecret(): string;
}

@injectable()
export class ConfigService implements IConfigService {
  private config: Map<string, any> = new Map();

  initialize(config: Record<string, any>): void {
    Object.entries(config).forEach(([key, value]) => {
      this.config.set(key, value);
    });
  }

  get<T = string>(key: string): T {
    return this.config.get(key) as T;
  }

  getJwtSecret(): string {
    return this.config.get('JWT_SECRET') || 'your-secret-key-change-in-production';
  }

  getJwtRefreshSecret(): string {
    return this.config.get('JWT_REFRESH_SECRET') || 'your-refresh-secret-change-in-production';
  }
}
