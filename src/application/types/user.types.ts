// Application layer types - derived from TypeBox schemas
// These are simple interfaces/types without validation decorators
// Validation happens at the HTTP layer using TypeBox

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roleNames?: string[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  isActive?: boolean;
}

export interface UpdateUserDtoWithId extends UpdateUserDto {
  id: string;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface UserIdDto {
  id: string;
}

export interface PaginationDto {
  page: number;
  limit: number;
}

// Response DTOs
export interface UserResponseDto {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
}

export interface PaginatedUsersResponseDto {
  users: UserResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
