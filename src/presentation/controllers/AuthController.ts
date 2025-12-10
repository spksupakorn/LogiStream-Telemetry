import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../infrastructure/di/types.js';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { ResponseBuilder } from '../../shared/utils/ResponseBuilder.js';
import { CreateUserDtoType, LoginDtoType, RefreshTokenDtoType } from '../schemas/auth.schema.js';

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TYPES.LoginUseCase) private loginUseCase: LoginUseCase
  ) {}

  async register(
    request: FastifyRequest<{ Body: CreateUserDtoType }>,
    reply: FastifyReply
  ): Promise<void> {
    const userDto = await this.createUserUseCase.execute(request.body);

    return reply.status(201).send(ResponseBuilder.created(userDto));
  }

  async login(
    request: FastifyRequest<{ Body: LoginDtoType }>,
    reply: FastifyReply
  ): Promise<void> {
    const authDto = await this.loginUseCase.execute(request.body);

    return reply.send(ResponseBuilder.success(authDto));
  }

  async refreshToken(
    request: FastifyRequest<{ Body: RefreshTokenDtoType }>,
    reply: FastifyReply
  ): Promise<void> {
    // Here you would implement token refresh logic
    // For now, returning a placeholder
    return reply.send(
      ResponseBuilder.success({ message: 'Token refresh not yet implemented' })
    );
  }
}
