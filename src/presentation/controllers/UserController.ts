import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../infrastructure/di/types.js';
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';
import { GetUserUseCase } from '../../application/use-cases/GetUserUseCase.js';
import { GetAllUsersUseCase } from '../../application/use-cases/GetAllUsersUseCase.js';
import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase.js';
import { ResponseBuilder } from '../../shared/utils/ResponseBuilder.js';
import {
  UserIdParamsType,
  PaginationQueryType,
  CreateUserBodyType,
  UpdateUserBodyType,
} from '../schemas/user.schema.js';

@injectable()
export class UserController {
  constructor(
    @inject(TYPES.CreateUserUseCase) private createUserUseCase: CreateUserUseCase,
    @inject(TYPES.GetUserUseCase) private getUserUseCase: GetUserUseCase,
    @inject(TYPES.GetAllUsersUseCase) private getAllUsersUseCase: GetAllUsersUseCase,
    @inject(TYPES.UpdateUserUseCase) private updateUserUseCase: UpdateUserUseCase,
    @inject(TYPES.DeleteUserUseCase) private deleteUserUseCase: DeleteUserUseCase
  ) {}

  async getAllUsers(
    request: FastifyRequest<{ Querystring: PaginationQueryType }>,
    reply: FastifyReply
  ): Promise<void> {
    const { page = 1, limit = 10 } = request.query;

    const paginatedDto = await this.getAllUsersUseCase.execute({
      page: Number(page),
      limit: Number(limit),
    });

    return reply.send(
      ResponseBuilder.paginated(paginatedDto.users, paginatedDto.page, paginatedDto.limit, paginatedDto.total)
    );
  }

  async getUserById(
    request: FastifyRequest<{ Params: UserIdParamsType }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    const userDto = await this.getUserUseCase.execute({ id });

    return reply.send(ResponseBuilder.success(userDto));
  }

  async createUser(
    request: FastifyRequest<{ Body: CreateUserBodyType }>,
    reply: FastifyReply
  ): Promise<void> {
    // const dto = await DtoValidator.validate(CreateUserDto, request.body);
    
    // Fastify's schema validation handles the body validation automatically before this handler is called.
    // The `UpdateUserBodyType` ensures `request.body` is correctly typed.
    // The custom `DtoValidator` is redundant and can be removed.

    const userDto = await this.createUserUseCase.execute(request.body);

    return reply.status(201).send(ResponseBuilder.created(userDto));
  }

  async updateUser(
    request: FastifyRequest<{ Params: UserIdParamsType; Body: UpdateUserBodyType }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    const userDto = await this.updateUserUseCase.execute({ ...request.body, id });

    return reply.send(ResponseBuilder.success(userDto));
  }

  async deleteUser(
    request: FastifyRequest<{ Params: UserIdParamsType }>,
    reply: FastifyReply
  ): Promise<void> {
    const { id } = request.params;

    await this.deleteUserUseCase.execute({ id });

    return reply.status(204).send();
  }
}
