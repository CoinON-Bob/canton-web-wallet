import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().required().messages({
    'string.empty': 'DATABASE_URL is required',
  }),

  REDIS_URL: Joi.string().optional().uri({ scheme: ['redis', 'rediss'] }),
  REDIS_HOST: Joi.string().optional(),
  REDIS_PORT: Joi.number().optional(),
  REDIS_PASSWORD: Joi.string().optional().allow(''),

  JWT_SECRET: Joi.string().min(16).required().messages({
    'string.min': 'JWT_SECRET must be at least 16 characters',
  }),
  JWT_EXPIRES_IN: Joi.string().default('7d'),
});
