const Joi = require("joi");
const freeEmailDomains = require("../freeEmailDomains.json");

const userValidationSchema = Joi.object({
  firstName: Joi.string().required().messages({
    "string.base": "First name should be a type of text",
    "string.empty": "First name cannot be empty",
    "any.required": "First name is required",
  }),
  lastName: Joi.string().required().messages({
    "string.base": "Last name should be a type of text",
    "string.empty": "Last name cannot be empty",
    "any.required": "Last name is required",
  }),
  profilePicture: Joi.string().uri().optional(),
  userType: Joi.string().valid("Admin", "Manager").required()
  .messages({
    'string.base': 'User type must be a string',
    'string.valid': 'User type must be either "admin" or "manager"',
    'string.empty': 'User type is required'
  }),
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .custom((value, helpers) => {
      const domain = value.split("@")[1];
      if (freeEmailDomains.includes(domain)) {
        return helpers.message(
          "Should accept only work emails and none of the free emails."
        );
      }
      return value;
    }, "Work email validation")
    .required()
    .messages({
      "string.base": "Email should be a type of text",
      "string.email": "Email must be a valid email address",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required",
    }),
  password: Joi.string()
    .min(8)
    .pattern(/(?=.*\d)/)
    .pattern(/(?=.*[!@#$%^&*(),.?":{}|<>])/)
    .pattern(/(?=.*[A-Z])/)
    .pattern(/(?=.*[a-z])/)
    .messages({
      'string.base': 'Password should be a type of text',
      'string.min': 'Password should have a minimum length of 8',
      "string.pattern.base": `Passwords should be a minimum of 8 letters with a combination of at least one number, 
    one special character, and one Capital letter.`,
    "string.empty": "Password cannot be empty",
      "any.required": "Password is required",
    })
    .required(),
});

const vegetableValidationSchema = Joi.object({
  name: Joi.string().required()
  .messages({
    "string.base": "name should be a type of text",
    "string.empty": "name cannot be empty",
    "any.required": "name is required",
  }),
  color: Joi.string()
    .pattern(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .required()
    .messages({
      "string.base": "color should be a type of text",
      "string.empty": "color cannot be empty",
      'string.pattern.base':'should be a hexa decimal color value',
      "any.required": "color is required",
    }),
  price: Joi.number().required()
  .messages({
    "number.base": "price should be a type of number",    
    "number.empty": "price cannot be empty",
    "any.required": "price is required",
  }),
});
module.exports = {
  userValidationSchema,
  vegetableValidationSchema,
};
