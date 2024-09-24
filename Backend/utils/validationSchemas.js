const Joi = require("joi");

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.{8,})/;

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Podaj prawidłowy adres email",
    "any.required": "Email jest wymagany",
  }),
  password: Joi.string().min(8).pattern(passwordRegex).required().messages({
    "string.min": "Hasło musi mieć co najmniej 8 znaków",
    "string.pattern.base":
      "Hasło musi zawierać co najmniej jedną dużą literę i jeden znak specjalny",
    "any.required": "Hasło jest wymagane",
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

module.exports = {
  registerSchema,
  loginSchema,
};
