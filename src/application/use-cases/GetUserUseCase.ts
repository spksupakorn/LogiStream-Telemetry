import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { UserIdDto, UserResponseDto } from '../dtos/user.dto.js';
import { UserMapper } from '../mappers/UserMapper.js';

@injectable()
export class GetUserUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(dto: UserIdDto): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserMapper.toDto(user);
  }
}
