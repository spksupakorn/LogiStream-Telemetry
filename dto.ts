//just comment no use

// import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
// import { Type } from 'class-transformer';

// export class PaginationDto {
//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   page?: number = 1;

//   @IsOptional()
//   @Type(() => Number)
//   @IsInt()
//   @Min(1)
//   @Max(100)
//   limit?: number = 10;
// }

// export class UserIdDto {
//   @IsString()
//   id!: string;
// }

//-------------------------------------

// import { IsString, IsEmail, IsOptional, MinLength, MaxLength, IsBoolean, IsArray } from 'class-validator';

// export class CreateUserDto {
//   @IsString()
//   @MinLength(3)
//   @MaxLength(100)
//   username!: string;

//   @IsEmail()
//   email!: string;

//   @IsString()
//   @MinLength(6)
//   @MaxLength(100)
//   password!: string;

//   @IsOptional()
//   @IsString()
//   @MaxLength(100)
//   firstName?: string;

//   @IsOptional()
//   @IsString()
//   @MaxLength(100)
//   lastName?: string;

//   @IsOptional()
//   @IsArray()
//   @IsString({ each: true })
//   roleNames?: string[];
// }

// export class UpdateUserDto {
//   @IsOptional()
//   @IsString()
//   @MinLength(3)
//   @MaxLength(100)
//   username?: string;

//   @IsOptional()
//   @IsEmail()
//   email?: string;

//   @IsOptional()
//   @IsString()
//   @MaxLength(100)
//   firstName?: string;

//   @IsOptional()
//   @IsString()
//   @MaxLength(100)
//   lastName?: string;

//   @IsOptional()
//   @IsBoolean()
//   isActive?: boolean;
// }

// export class LoginDto {
//   @IsString()
//   username!: string;

//   @IsString()
//   password!: string;
// }

// export class UserResponseDto {
//   id!: string;
//   username!: string;
//   email!: string;
//   firstName?: string;
//   lastName?: string;
//   isActive!: boolean;
//   roles!: string[];
//   createdAt!: Date;
//   updatedAt!: Date;
// }

// export class AuthResponseDto {
//   accessToken!: string;
//   refreshToken!: string;
//   user!: {
//     id: string;
//     username: string;
//     email: string;
//     roles: string[];
//   };
// }

// export class PaginatedUsersResponseDto {
//   users!: UserResponseDto[];
//   total!: number;
//   page!: number;
//   limit!: number;
//   totalPages!: number;
// }

//-------------------------------------

// import { plainToClass } from 'class-transformer';
// import { validate, ValidationError as ClassValidatorError } from 'class-validator';
// import { ValidationError } from '../errors/index.js';

// export class DtoValidator {
//   static async validate<T extends object>(dtoClass: new () => T, data: any): Promise<T> {
//     const dtoInstance = plainToClass(dtoClass, data);
//     const errors = await validate(dtoInstance as object);

//     if (errors.length > 0) {
//       const formattedErrors = this.formatErrors(errors);
//       throw new ValidationError('Validation failed', formattedErrors);
//     }

//     return dtoInstance;
//   }

//   private static formatErrors(errors: ClassValidatorError[]): any {
//     return errors.reduce((acc: any, error: ClassValidatorError) => {
//       const constraints = error.constraints;
//       if (constraints) {
//         acc[error.property] = Object.values(constraints);
//       }
//       return acc;
//     }, {});
//   }
// }