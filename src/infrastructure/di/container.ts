import 'reflect-metadata';
import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from './types.js';

// Repositories
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { PermissionRepository } from '../repositories/PermissionRepository.js';

// Use Cases
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';
import { GetUserUseCase } from '../../application/use-cases/GetUserUseCase.js';
import { GetAllUsersUseCase } from '../../application/use-cases/GetAllUsersUseCase.js';
import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';

// Controllers
import { AuthController } from '../../presentation/controllers/AuthController.js';
import { UserController } from '../../presentation/controllers/UserController.js';

export const createContainer = (dataSource: DataSource): Container => {
  const container = new Container();

  // Bind DataSource
  container.bind<DataSource>(TYPES.DataSource).toConstantValue(dataSource);

  // Bind Repositories
  // By using .to(), Inversify will automatically resolve dependencies declared in the constructor (like DataSource).
  // This assumes that UserRepository, RoleRepository, etc., have their constructors decorated with @inject.
  container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope();
  container.bind<IRoleRepository>(TYPES.IRoleRepository).to(RoleRepository).inSingletonScope();
  container.bind<IPermissionRepository>(TYPES.IPermissionRepository).to(PermissionRepository).inSingletonScope();

  // Bind Use Cases
  container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
  container.bind<GetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase);
  container.bind<GetAllUsersUseCase>(TYPES.GetAllUsersUseCase).to(GetAllUsersUseCase);
  container.bind<UpdateUserUseCase>(TYPES.UpdateUserUseCase).to(UpdateUserUseCase);
  container.bind<DeleteUserUseCase>(TYPES.DeleteUserUseCase).to(DeleteUserUseCase);
  container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);

  // Bind Controllers
  container.bind<AuthController>(TYPES.AuthController).to(AuthController);
  container.bind<UserController>(TYPES.UserController).to(UserController);

  return container;
};
