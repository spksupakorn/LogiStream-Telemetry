import { plainToClass } from 'class-transformer';
import { validate, ValidationError as ClassValidatorError } from 'class-validator';
import { ValidationError } from '../errors/index.js';

export class DtoValidator {
  static async validate<T extends object>(dtoClass: new () => T, data: any): Promise<T> {
    const dtoInstance = plainToClass(dtoClass, data);
    const errors = await validate(dtoInstance as object);

    if (errors.length > 0) {
      const formattedErrors = this.formatErrors(errors);
      throw new ValidationError('Validation failed', formattedErrors);
    }

    return dtoInstance;
  }

  private static formatErrors(errors: ClassValidatorError[]): any {
    return errors.reduce((acc: any, error: ClassValidatorError) => {
      const constraints = error.constraints;
      if (constraints) {
        acc[error.property] = Object.values(constraints);
      }
      return acc;
    }, {});
  }
}
