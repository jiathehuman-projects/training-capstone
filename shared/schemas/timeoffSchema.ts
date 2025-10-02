/**
 * Schema definition to validate against for time-off related fields
 */
import Joi from 'joi';
import { TimeOffStatus } from '../models/enums';

export const createTimeOffRequestSchema = Joi.object({
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'Start date must be in YYYY-MM-DD format'
    }),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'End date must be in YYYY-MM-DD format'
    }),
  reason: Joi.string()
    .max(500)
    .optional()
    .allow('')
});

export const timeOffQuerySchema = Joi.object({
  status: Joi.string()
    .valid(...Object.values(TimeOffStatus))
    .optional(),
  startDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  endDate: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .optional()
});