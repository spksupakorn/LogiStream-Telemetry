import 'reflect-metadata';
import { Container } from 'inversify';
import { DataSource } from 'typeorm';
import { TYPES } from './types.js';

// Repositories
import { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import { IRoleRepository } from '../../domain/repositories/IRoleRepository.js';
import { IPermissionRepository } from '../../domain/repositories/IPermissionRepository.js';
import { ITelemetryRepository } from '../../domain/repositories/ITelemetryRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { RoleRepository } from '../repositories/RoleRepository.js';
import { PermissionRepository } from '../repositories/PermissionRepository.js';
import { TelemetryRepository } from '../repositories/TelemetryRepository.js';

// Services
import { IMessageBus } from '../../domain/services/IMessageBus.js';
import { KafkaMessageBus } from '../messaging/KafkaMessageBus.js';

// Use Cases
import { CreateUserUseCase } from '../../application/use-cases/CreateUserUseCase.js';
import { GetUserUseCase } from '../../application/use-cases/GetUserUseCase.js';
import { GetAllUsersUseCase } from '../../application/use-cases/GetAllUsersUseCase.js';
import { UpdateUserUseCase } from '../../application/use-cases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from '../../application/use-cases/DeleteUserUseCase.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { IngestTelemetryUseCase } from '../../application/use-cases/IngestTelemetryUseCase.js';

// Controllers
import { AuthController } from '../../presentation/controllers/AuthController.js';
import { UserController } from '../../presentation/controllers/UserController.js';
import { TelemetryController } from '../../presentation/controllers/TelemetryController.js';

// Config
import { IConfigService, ConfigService } from '../config/ConfigService.js';

// Transaction
import { ITransactionManager, TransactionManager } from '../database/TransactionManager.js';

export const createContainer = (dataSource: DataSource, config?: Record<string, any>): Container => {
  const container = new Container();

  // Bind DataSource
  container.bind<DataSource>(TYPES.DataSource).toConstantValue(dataSource);

  // Bind Config Service
  const configService = new ConfigService();
  if (config) {
    configService.initialize(config);
  }
  container.bind<IConfigService>(TYPES.IConfigService).toConstantValue(configService);

  // Bind Transaction Manager
  container.bind<ITransactionManager>(TYPES.ITransactionManager).to(TransactionManager).inSingletonScope();

  // Bind Repositories
  // By using .to(), Inversify will automatically resolve dependencies declared in the constructor (like DataSource).
  // This assumes that UserRepository, RoleRepository, etc., have their constructors decorated with @inject.
  container.bind<IUserRepository>(TYPES.IUserRepository).to(UserRepository).inSingletonScope();
  container.bind<IRoleRepository>(TYPES.IRoleRepository).to(RoleRepository).inSingletonScope();
  container.bind<IPermissionRepository>(TYPES.IPermissionRepository).to(PermissionRepository).inSingletonScope();
  container.bind<ITelemetryRepository>(TYPES.ITelemetryRepository).to(TelemetryRepository).inSingletonScope();

  // Bind Services
  container.bind<IMessageBus>(TYPES.IMessageBus).to(KafkaMessageBus).inSingletonScope();

  // Bind Use Cases
  container.bind<CreateUserUseCase>(TYPES.CreateUserUseCase).to(CreateUserUseCase);
  container.bind<GetUserUseCase>(TYPES.GetUserUseCase).to(GetUserUseCase);
  container.bind<GetAllUsersUseCase>(TYPES.GetAllUsersUseCase).to(GetAllUsersUseCase);
  container.bind<UpdateUserUseCase>(TYPES.UpdateUserUseCase).to(UpdateUserUseCase);
  container.bind<DeleteUserUseCase>(TYPES.DeleteUserUseCase).to(DeleteUserUseCase);
  container.bind<LoginUseCase>(TYPES.LoginUseCase).to(LoginUseCase);
  container.bind<IngestTelemetryUseCase>(TYPES.IngestTelemetryUseCase).to(IngestTelemetryUseCase);

  // Bind Controllers
  container.bind<AuthController>(TYPES.AuthController).to(AuthController);
  container.bind<UserController>(TYPES.UserController).to(UserController);
  container.bind<TelemetryController>(TYPES.TelemetryController).to(TelemetryController);

  return container;
};
