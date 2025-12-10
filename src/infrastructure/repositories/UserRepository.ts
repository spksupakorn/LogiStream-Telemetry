import { injectable, inject } from 'inversify';
import { Repository, DataSource } from 'typeorm';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { User } from '../../domain/entities/User.entity.js';
import { TYPES } from '../di/types.js';

@injectable()
export class UserRepository implements IUserRepository {
  private userRepository: Repository<User>;

  constructor(@inject(TYPES.DataSource) private readonly dataSource: DataSource) {
    this.userRepository = this.dataSource.getRepository(User);
  }

  async findById(id: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { id },
      relations: ['roles', 'roles.permissions']
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { email },
      relations: ['roles', 'roles.permissions']
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findOne({ 
      where: { username },
      relations: ['roles', 'roles.permissions']
    });
  }

  async findAll(skip: number = 0, take: number = 10): Promise<[User[], number]> {
    return await this.userRepository.findAndCount({
      relations: ['roles'],
      skip,
      take,
      order: { createdAt: 'DESC' }
    });
  }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async update(id: string, userData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, userData);
    return await this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  async existsByUsername(username: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { username } });
    return count > 0;
  }
}
