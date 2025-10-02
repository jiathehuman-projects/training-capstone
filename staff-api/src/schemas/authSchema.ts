/**
 * Schema definition to validate against for user creation
 * Ported over from Weather App two modules ago
 */
import Joi from 'joi';

export const userCreationSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().max(255).required(),
  password: Joi.string().min(8).max(30).required(),
  repeat_password: Joi.string().min(8).max(30).valid(Joi.ref("password")).required(),
  firstName: Joi.string().max(100).required(),
  lastName: Joi.string().max(100).required(),
  phone: Joi.string().max(50).allow(null, ''),
  profileUrl: Joi.string().uri().allow(null, '')
});

export const userLoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});