import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import * as Joi from 'joi';
@Injectable()
export class JoiValidationPipe implements PipeTransform {
  constructor(private readonly schema: Joi.Schema) {}

  transform(value: any) {
    const { error, value: validatedValue } = this.schema.validate(value, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    });
    if (error) {
      const errorMessage = error.details.map((err) => err.message);
      throw new BadRequestException(errorMessage);
    }
    return validatedValue;
  }
}
