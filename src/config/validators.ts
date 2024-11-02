import Joi, { ObjectSchema } from "joi";

const isSignUp: ObjectSchema = Joi.object().keys({
  username: Joi.string().min(4).max(12).required().messages({
    "string.base": "Username must be of type string",
    "string.min": "Invalid username",
    "string.max": "Invalid username",
    "string.empty": "Username is a required field",
  }),
  password: Joi.string().min(4).max(12).required().messages({
    "string.base": "Password must be of type string",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.empty": "Password is a required field",
  }),
  country: Joi.string().required().messages({
    "string.base": "Country must be of type string",
    "string.empty": "Country is a required field",
  }),
  email: Joi.string().email().required().messages({
    "string.base": "Email must be of type string",
    "string.email": "Invalid email",
    "string.empty": "Email is a required field",
  }),
  profilePicture: Joi.string().required().messages({
    "string.base": "Please add a profile picture",
    "string.email": "Profile picture is required",
    "string.empty": "Profile picture is required",
  }),
  browserName: Joi.string().optional(),
  deviceType: Joi.string().optional(),
});

const isLogin: ObjectSchema = Joi.object().keys({
  username: Joi.alternatives().conditional(Joi.string().email(), {
    then: Joi.string().email().required().messages({
      "string.base": "Email must be of type string",
      "string.email": "Invalid email",
      "string.empty": "Email is a required field",
    }),
    otherwise: Joi.string().min(4).max(12).required().messages({
      "string.base": "Username must be of type string",
      "string.min": "Invalid username",
      "string.max": "Invalid username",
      "string.empty": "Username is a required field",
    }),
  }),
  password: Joi.string().min(4).max(12).required().messages({
    "string.base": "Password must be of type string",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.empty": "Password is a required field",
  }),
  browserName: Joi.string().optional(),
  deviceType: Joi.string().optional(),
});

const isEmail: ObjectSchema = Joi.object().keys({
  email: Joi.string().email().required().messages({
    "string.base": "Field must be valid",
    "string.required": "Field must be valid",
    "string.email": "Field must be valid",
  }),
});

const isSetPassword: ObjectSchema = Joi.object().keys({
  password: Joi.string().required().min(4).max(12).messages({
    "string.base": "Password should be of type string",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.empty": "Password is a required field",
  }),
  confirmPassword: Joi.string().required().valid(Joi.ref("password")).messages({
    "any.only": "Passwords should match",
    "any.required": "Confirm password is a required field",
  }),
});

const isChangePassword: ObjectSchema = Joi.object().keys({
  currentPassword: Joi.string().required().min(4).max(8).messages({
    "string.base": "Password should be of type string",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.empty": "Password is a required field",
  }),
  newPassword: Joi.string().required().min(4).max(12).messages({
    "string.base": "Password should be of type string",
    "string.min": "Invalid password",
    "string.max": "Invalid password",
    "string.empty": "Password is a required field",
  }),
});

export { isEmail, isSetPassword, isChangePassword, isSignUp, isLogin };
