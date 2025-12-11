import { injectable, inject } from 'inversify';
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IConfigService } from '../../infrastructure/config/ConfigService.js';
import { UnauthorizedError } from '../../shared/errors/index.js';
import { TYPES } from '../../infrastructure/di/types.js';
import { LoginDto, AuthResponseDto } from '../types/user.types.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

@injectable()
export class LoginUseCase {
  constructor(
    @inject(TYPES.IUserRepository) private userRepository: IUserRepository,
    @inject(TYPES.IConfigService) private configService: IConfigService
  ) {}

  async execute(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user by username or email
    let user = await this.userRepository.findByUsername(dto.username);
    if (!user) {
      user = await this.userRepository.findByEmail(dto.username);
    }

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(dto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Generate tokens
    const jwtSecret = this.configService.getJwtSecret();
    const jwtRefreshSecret = this.configService.getJwtRefreshSecret();

    const roleNames = user.roles?.map(role => role.name) || [];
    const permissions = user.roles?.flatMap(role => 
      role.permissions?.map(p => p.name) || []
    ) || [];

    const payload = {
      userId: user.id,
      username: user.username,
      email: user.email,
      roles: roleNames,
      permissions
    };

    const accessToken = jwt.sign(payload, jwtSecret, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId: user.id }, jwtRefreshSecret, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: roleNames
      }
    };
  }
}
