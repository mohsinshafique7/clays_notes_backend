import * as Joi from 'joi';
const customValidation = (
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

const update = Joi.object({
  name: Joi.string().trim().custom(customValidation).messages({
    'any.required': 'Account name is required.',
    'string.empty': 'Account name must not be empty.',
    'any.invalid': 'Account name must not be empty or consist only of spaces.',
    'string.pattern.base': 'Account name should be alphabet',
  }),
  gender: Joi.string()
    .valid('male', 'female', 'other')
    .trim()
    .custom((value: string, helpers: Joi.CustomHelpers<string>) => {
      if (value.trim() === '') {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.required': 'Gender is required.',
      'any.only': 'Gender must be either male, female, or other.',
      'any.invalid':
        'Account name must not be empty or consist only of spaces.',
    }),
});
export const getAllRecords = Joi.object({
  perPage: Joi.number().integer().required().messages({
    'any.required': 'Per page is required.',
    'number.base': 'Per page must be a valid number.',
    'number.integer': 'Per page must be an integer value.',
  }),

  currentPage: Joi.number().integer().required().messages({
    'any.required': 'Current page is required.',
    'number.base': 'Current page must be a valid number.',
    'number.integer': 'Current Page must be an integer value.',
  }),
});
export { update };
