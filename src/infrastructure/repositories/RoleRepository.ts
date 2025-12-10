import { injectable, inject } from 'inversify';
import { Repository, DataSource } from 'typeorm';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { Role } from '../../domain/entities/Role.entity.js';
import { TYPES } from '../di/types.js';

@injectable()
export class RoleRepository implements IRoleRepository {
  private roleRepository: Repository<Role>;

  constructor(@inject(TYPES.DataSource) private readonly dataSource: DataSource) {
    this.roleRepository = this.dataSource.getRepository(Role);
  }

  async findById(id: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ 
      where: { id },
      relations: ['permissions']
    });
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({ 
      where: { name },
      relations: ['permissions']
    });
  }

  async findAll(): Promise<Role[]> {
    return await this.roleRepository.find({
      relations: ['permissions'],
      order: { name: 'ASC' }
    });
  }

  async create(roleData: Partial<Role>): Promise<Role> {
    const role = this.roleRepository.create(roleData);
    return await this.roleRepository.save(role);
  }

  async update(id: string, roleData: Partial<Role>): Promise<Role | null> {
    await this.roleRepository.update(id, roleData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.roleRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
