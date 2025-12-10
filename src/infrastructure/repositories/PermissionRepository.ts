import { injectable, inject } from 'inversify';
import { Repository, DataSource } from 'typeorm';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import { Permission } from '../../domain/entities/Permission.entity.js';
import { TYPES } from '../di/types.js';

@injectable()
export class PermissionRepository implements IPermissionRepository {
  private permissionRepository: Repository<Permission>;

  constructor(@inject(TYPES.DataSource) private readonly dataSource: DataSource) {
    this.permissionRepository = this.dataSource.getRepository(Permission);
  }

  async findById(id: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { id } });
  }

  async findByName(name: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { name } });
  }

  async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    return await this.permissionRepository.findOne({ where: { resource, action } });
  }

  async findAll(): Promise<Permission[]> {
    return await this.permissionRepository.find({
      order: { resource: 'ASC', action: 'ASC' }
    });
  }

  async create(permissionData: Partial<Permission>): Promise<Permission> {
    const permission = this.permissionRepository.create(permissionData);
    return await this.permissionRepository.save(permission);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.permissionRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
