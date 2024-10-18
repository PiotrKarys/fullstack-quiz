const Joi = require("joi");

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])(?=.{8,})/;

const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .max(255)
    .trim()
    .lowercase()
    .required()
    .messages({
      "string.email": "Nieprawidłowy format email",
      "string.max": "Email nie może być dłuższy niż 255 znaków",
      "any.required": "Email jest wymagany",
    }),
  password: Joi.string()
    .pattern(passwordRegex)
    .min(8)
    .max(100)
    .trim()
    .required()
    .messages({
      "string.pattern.base":
        "Hasło musi zawierać co najmniej 8 znaków, jedną dużą literę, jedną cyfrę i jeden znak specjalny",
      "string.min": "Hasło musi mieć co najmniej 8 znaków",
      "string.max": "Hasło nie może być dłuższe niż 100 znaków",
      "any.required": "Hasło jest wymagane",
    }),
  confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
    "any.only": "Hasła muszą być takie same",
    "any.required": "Potwierdzenie hasła jest wymagane",
  }),
  name: Joi.string().min(3).max(30).trim().required().messages({
    "string.min": "Nazwa użytkownika musi mieć co najmniej 3 znaki",
    "string.max": "Nazwa użytkownika nie może być dłuższa niż 30 znaków",
    "any.required": "Nazwa użytkownika jest wymagana",
    "string.empty": "Nazwa użytkownika nie może być pusta",
  }),
});

const loginSchema = Joi.object({
  login: Joi.alternatives()
    .try(
      Joi.string().email().messages({
        "string.email": "Podaj prawidłowy adres email",
      }),
      Joi.string().max(100).messages({
        "string.max": "Nazwa użytkownika nie może być dłuższa niż 100 znaków",
      })
    )
    .required()
    .messages({
      "any.required": "Email lub nazwa użytkownika są wymagane",
    }),
  password: Joi.string().required().messages({
    "any.required": "Hasło jest wymagane",
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    "string.empty": "Token odświeżający jest wymagany",
    "any.required": "Token odświeżający jest wymagany",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};
