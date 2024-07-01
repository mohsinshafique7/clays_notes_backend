import * as Joi from 'joi';

export const createNoteSchema = Joi.object({
  title: Joi.string().trim().required().messages({
    'any.required': 'Note title is required.',
    'string.empty': 'Note title must not be empty.',
  }),
  description: Joi.string().trim().required().messages({
    'any.required': 'Note description is required.',
    'string.empty': 'Note description must not be empty.',
  }),
});
