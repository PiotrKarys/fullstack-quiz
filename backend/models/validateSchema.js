const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Podaj prawidłowy adres email",
    "any.required": "Email jest wymagany",
  }),
  password: Joi.string().min(8).required().messages({
    "string.min": "Hasło musi mieć co najmniej 8 znaków",
    "any.required": "Hasło jest wymagane",
  }),
  name: Joi.string().min(2).max(50).messages({
    "string.min": "Imię musi mieć co najmniej 2 znaki",
    "string.max": "Imię nie może być dłuższe niż 50 znaków",
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Podaj prawidłowy adres email",
    "any.required": "Email jest wymagany",
  }),
  password: Joi.string().required().messages({
    "any.required": "Hasło jest wymagane",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "any.required": "Token odświeżający jest wymagany",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
