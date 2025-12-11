import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { Role } from '../../domain/entities/Role.entity.js';
import { NotFoundError, ConflictError } from '../../shared/errors/index.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { CreateUserDto, UserResponseDto } from '../types/user.types.js';
import { UserMapper } from '../mappers/UserMapper.js';
import bcrypt from 'bcrypt';

@injectable()
export class CreateUserUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IRoleRepository) private roleRepository: IRoleRepository
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    // Check if user with the same email or username already exists
    const [existingUserByEmail, existingUserByUsername] = await Promise.all([
      this.userRepository.findByEmail(dto.email),
      this.userRepository.findByUsername(dto.username)
    ]);

    if (existingUserByEmail) {
      throw new ConflictError('User with this email already exists');
    }
    if (existingUserByUsername) {
      throw new ConflictError('Username already taken');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.userRepository.create({
      username: dto.username,
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: true
    });

    // Assign roles if provided
    if (dto.roleNames && dto.roleNames.length > 0) {
      const foundRoles = await Promise.all(
        dto.roleNames.map(name => this.roleRepository.findByName(name))
      );

      const notFoundRoleNames = dto.roleNames.filter(
        (_, index) => !foundRoles[index]
      );

      if (notFoundRoleNames.length > 0) {
        throw new NotFoundError(`Roles not found: ${notFoundRoleNames.join(', ')}`);
      }

      // Filter out any nulls just in case, though the check above should prevent this.
      const validRoles = foundRoles.filter((role): role is Role => role !== null);
      user.roles = validRoles;
      
      // Use save() to update many-to-many relations, not update()
      await this.userRepository.save(user);
    }

    // Fetch the complete user with roles
    const userWithRoles = await this.userRepository.findById(user.id);
    if (!userWithRoles) {
      throw new NotFoundError('User not found after creation');
    }

    return UserMapper.toDto(userWithRoles);
  }
}
