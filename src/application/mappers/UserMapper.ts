import { User } from '../../domain/entities/User.entity.js';
import { UserResponseDto } from '../dtos/user.dto.js';

export class UserMapper {
  static toDto(user: User): UserResponseDto {
    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      roles: user.roles?.map((r) => r.name) || [],
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  static toDtoList(users: User[]): UserResponseDto[] {
    return users.map((user) => this.toDto(user));
  }
}
