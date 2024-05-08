import * as Joi from 'joi';
import * as moment from 'moment';
const customDateValidation = (
  value: string,
  helpers: Joi.CustomHelpers<string>,
) => {
  if (!moment(value, 'YYYY-MM-DD', true).isValid()) {
    return helpers.error('any.valid');
  }
  if (moment(value).isAfter(moment(), 'day')) {
    return helpers.error('any.future');
  }
  return moment(value, 'YYYY-MM-DD', true).format('YYYY-MM-DD');
};
export const createSchema = Joi.object({
  sleepHours: Joi.number()
    .integer()
    .strict()
    .required()
    .min(1)
    .max(24)
    .messages({
      'any.required': 'Sleep hours is required.',
      'number.base': 'Sleep hours must be a valid number.',
      'number.integer': 'Sleep hours must be an integer value.',
      'number.min': 'Sleep hours must be at least 1 hour.',
      'number.max': 'Sleep hours cannot exceed 24 hours.',
    }),
  accountId: Joi.number().integer().strict().required().messages({
    'any.required': 'AccountId is required.',
    'number.base': 'AccountId must be a valid number.',
    'number.integer': 'AccountId must be an integer value.',
  }),
  date: Joi.string().required().custom(customDateValidation).messages({
    'any.required': 'Date is required.',
    'string.empty': 'Date must not be empty.',
    'any.valid': 'Please enter a valid date in the YYYY-MM-DD format.',
    'any.future': 'Please enter a date that is not in the future.',
  }),
});

export const update = Joi.object({
  sleepHours: Joi.number().integer().min(1).max(24).messages({
    'number.base': 'Sleep hours must be a valid number.',
    'number.integer': 'Sleep hours must be an integer value.',
    'number.min': 'Sleep hours must be at least 1 hour.',
    'number.max': 'Sleep hours cannot exceed 24 hours.',
  }),
  accountId: Joi.number().messages({
    'number.base': 'Sleep hours must be a valid number.',
    'number.integer': 'Sleep hours must be an integer value.',
  }),
  date: Joi.string().custom(customDateValidation).messages({
    'any.required': 'Date is required.',
    'string.empty': 'Date must not be empty.',
    'any.valid': 'Please enter a valid date in the YYYY-MM-DD format.',
    'any.future': 'Please enter a date that is not in the future.',
  }),
});
export const getAllRecords = Joi.object({
  perPage: Joi.number().integer().required().messages({
    'any.required': 'Per Page is required.',
    'number.base': 'Per Page must be a valid number.',
    'number.integer': 'Per Page must be an integer value.',
  }),

  currentPage: Joi.number().integer().required().messages({
    'any.required': 'Current Page is required.',
    'number.base': 'Current Page must be a valid number.',
    'number.integer': 'Current Page must be an integer value.',
  }),
});

export class CreateSleepRecordDto {
  accountId: number;
  date: Date;
  sleepHours: number;
}
export class UpdateSleepRecordDto {
  accountId?: number;
  date?: Date;
  sleepHours?: number;
}
export class GetAllDto {
  perPage: string;
  currentPage: string;
}
