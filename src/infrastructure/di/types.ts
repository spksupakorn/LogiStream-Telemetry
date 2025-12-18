export const TYPES = {
  // Repositories
  IUserRepository: Symbol.for('IUserRepository'),
  IRoleRepository: Symbol.for('IRoleRepository'),
  IPermissionRepository: Symbol.for('IPermissionRepository'),
  ITelemetryRepository: Symbol.for('ITelemetryRepository'),
  
  // Services
  IMessageBus: Symbol.for('IMessageBus'),
  
  // Use Cases
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  GetAllUsersUseCase: Symbol.for('GetAllUsersUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
  LoginUseCase: Symbol.for('LoginUseCase'),
  IngestTelemetryUseCase: Symbol.for('IngestTelemetryUseCase'),
  
  // Controllers
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
  TelemetryController: Symbol.for('TelemetryController'),
  
  // Infrastructure
  DataSource: Symbol.for('DataSource'),
  IConfigService: Symbol.for('IConfigService'),
  ITransactionManager: Symbol.for('ITransactionManager')
};
