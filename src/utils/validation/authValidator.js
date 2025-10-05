import joi from "joi";

/** validation keys and properties of user */
const creationUser = joi
  .object({
    name: joi.string().required(),
    email: joi.string().required(),
    password: joi.string().required(),
    phone: joi.string().required(),
  })
  .unknown(true);

const updateProfile = joi
  .object({
    name: joi.string().optional(),
    email: joi.string().email().optional(),
    phone: joi.string().optional(),
    country: joi.string().optional(),
    state: joi.string().optional(),
    city: joi.string().optional(),
  })
  .unknown(true);

export default { creationUser, updateProfile };
