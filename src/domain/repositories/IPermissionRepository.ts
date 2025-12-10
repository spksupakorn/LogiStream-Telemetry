import { Permission } from '../entities/Permission.entity.js';

export interface IPermissionRepository {
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findByResourceAndAction(resource: string, action: string): Promise<Permission | null>;
  findAll(): Promise<Permission[]>;
  create(permission: Partial<Permission>): Promise<Permission>;
  delete(id: string): Promise<boolean>;
}
