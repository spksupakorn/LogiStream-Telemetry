export const TYPES = {
  // Repositories
  IUserRepository: Symbol.for('IUserRepository'),
  IRoleRepository: Symbol.for('IRoleRepository'),
  IPermissionRepository: Symbol.for('IPermissionRepository'),
  
  // Use Cases
  CreateUserUseCase: Symbol.for('CreateUserUseCase'),
  GetUserUseCase: Symbol.for('GetUserUseCase'),
  GetAllUsersUseCase: Symbol.for('GetAllUsersUseCase'),
  UpdateUserUseCase: Symbol.for('UpdateUserUseCase'),
  DeleteUserUseCase: Symbol.for('DeleteUserUseCase'),
  LoginUseCase: Symbol.for('LoginUseCase'),
  
  // Controllers
  AuthController: Symbol.for('AuthController'),
  UserController: Symbol.for('UserController'),
  
  // Infrastructure
  DataSource: Symbol.for('DataSource')
};
