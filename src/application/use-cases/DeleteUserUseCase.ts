import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { NotFoundError } from '../../shared/errors/index.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { UserIdDto } from '../dtos/PaginationDto.js';

@injectable()
export class DeleteUserUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository
  ) {}

  async execute(dto: UserIdDto): Promise<void> {
    const user = await this.userRepository.findById(dto.id);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.delete(dto.id);
  }
}
