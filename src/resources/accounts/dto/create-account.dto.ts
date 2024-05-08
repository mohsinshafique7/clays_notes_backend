import * as Joi from 'joi';
import * as moment from 'moment';
export class CreateAccountDto {
  name: string;
  gender: string;
  sleepRecord: SleepRecordDto;
}

// sleep-record.dto.ts
export class SleepRecordDto {
  sleepHours: number;
  date: Date;
}

export class UpdateAccountDto {
  name: string;
  gender: string;
}
// export class CreateAccountDto {
//   account: AccountDto;
//   sleepRecord: SleepRecordDto;
// }
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
const customStringValidation = (
  value: string,
  helpers: Joi.CustomHelpers<string>,
) => {
  const pattern = /^[a-zA-Z\s]*$/;

  if (!pattern.test(value)) {
    return helpers.error('string.pattern.base', { regex: pattern });
  }
  if (value.trim() === '') {
    return helpers.error('any.invalid');
  }
  return value;
};
export const createSchema = Joi.object({
  name: Joi.string()
    .required()
    .trim()
    // .pattern(/^[A-Za-z]+$/)
    .custom(customStringValidation)
    .messages({
      'any.invalid':
        'Account name must not be empty or consist only of spaces.',
      'string.pattern.base': 'Account name should be alphabet',
      'string.empty': 'Account name must not be empty.',
      'any.required': 'Account name is required.',
    }),
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .required()
    .trim()
    .messages({
      'string.empty': 'Gender must not be empty.',
      'any.required': 'Gender is required.',
      'any.only': 'Gender must be either male female or other.',
    }),

  sleepRecord: Joi.object({
    sleepHours: Joi.number().required().integer().min(1).max(24).messages({
      'number.base': 'Sleep hours must be a valid number.',
      'any.required': 'Sleep hours is required.',
      'number.integer': 'Sleep hours must be an integer value.',
      'number.min': 'Sleep hours must be at least 1 hour.',
      'number.max': 'Sleep hours cannot exceed 24 hours.',
    }),
    date: Joi.date()
      .required()
      .max('now')
      .custom(customDateValidation)
      .messages({
        'date.base': 'Date must be a valid date. YYYY-MM-DD',
        'any.required': 'Date is required.',
        'date.isoDate': 'Date must be in ISO date format (YYYY-MM-DD).',
        'date.max': 'Date cannot be in the future.',
      }),
  })
    .required()
    .messages({
      'object.base': 'Sleep record required',
      'any.required': 'Sleep record required',
    }),
});

export class GetAllDto {
  perPage: string;
  currentPage: string;
}
