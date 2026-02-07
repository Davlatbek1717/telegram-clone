const Joi = require('joi');

/**
 * Validate phone number format
 */
function validatePhone(phone) {
  const phoneRegex = /^\+998[0-9]{9}$/;
  return phoneRegex.test(phone);
}

/**
 * Register validation schema
 */
const registerSchema = Joi.object({
  phone: Joi.string()
    .pattern(/^\+998[0-9]{9}$/)
    .required()
    .messages({
      'string.pattern.base': 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak',
      'any.required': 'Telefon raqami majburiy'
    }),
  email: Joi.string()
    .email()
    .allow('', null)
    .messages({
      'string.email': 'Email noto\'g\'ri formatda'
    }),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Parol kamida 8 ta belgidan iborat bo\'lishi kerak',
      'any.required': 'Parol majburiy'
    }),
  firstName: Joi.string()
    .min(1)
    .max(64)
    .required()
    .messages({
      'string.min': 'Ism bo\'sh bo\'lmasligi kerak',
      'string.max': 'Ism 64 ta belgidan oshmasligi kerak',
      'any.required': 'Ism majburiy'
    }),
  lastName: Joi.string()
    .max(64)
    .allow('', null)
    .messages({
      'string.max': 'Familiya 64 ta belgidan oshmasligi kerak'
    }),
  username: Joi.string()
    .pattern(/^@?[a-zA-Z0-9_]{3,32}$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Username 3-32 ta harf, raqam yoki _ dan iborat bo\'lishi kerak'
    })
});

/**
 * Login validation schema
 */
const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Username, email yoki telefon majburiy'
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Parol majburiy'
    })
});

module.exports = {
  validatePhone,
  registerSchema,
  loginSchema
};
