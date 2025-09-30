/**
 * Schema definition to validate against for ordering-related fields
 */
import Joi from 'joi';
import { OrderStatus } from '../models/enums';

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        menuItemId: Joi.number().integer().positive().required(),
        quantity: Joi.number().integer().min(1).max(10).required(),
        customizations: Joi.string().max(500).optional()
      })
    )
    .min(1)
    .max(20)
    .required(),
  tableNumber: Joi.number().integer().min(1).max(100).required()
});

export const confirmOrderSchema = Joi.object({
  confirmed: Joi.boolean().valid(true).required()
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      OrderStatus.IN_KITCHEN,
      OrderStatus.READY,
      OrderStatus.SERVED,
      OrderStatus.CLOSED,
      OrderStatus.CANCELLED
    )
    .required()
});