import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { UpdateUserDtoWithId, UserResponseDto } from '../dtos/user.dto.js';
import { UserMapper } from '../mappers/UserMapper.js';

@injectable()
export class UpdateUserUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(dto: UpdateUserDtoWithId): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Extract updates from dto (excluding id)
    const { id, ...updates } = dto;

    const updatedUser = await this.userRepository.update(dto.id, updates);
    if (!updatedUser) {
      throw new NotFoundError('User not found after update');
    }

    return UserMapper.toDto(updatedUser);
  }
}
