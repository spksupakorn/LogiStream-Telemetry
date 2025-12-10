import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { PaginationDto } from '../dtos/PaginationDto.js';
import { PaginatedUsersResponseDto } from '../dtos/UserDto.js';
import { UserMapper } from '../mappers/UserMapper.js';

@injectable()
export class GetAllUsersUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(dto: PaginationDto): Promise<PaginatedUsersResponseDto> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 10;
    const skip = (page - 1) * limit;
    const [users, total] = await this.userRepository.findAll(skip, limit);
    
    return {
      users: UserMapper.toDtoList(users),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
