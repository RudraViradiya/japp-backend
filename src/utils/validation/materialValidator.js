import joi from "joi";

/** validation keys and properties of user */
const creationMaterial = joi
  .object({
    name: joi.string().required(),
    category: joi.string().required(),
  })
  .unknown(true);

export default { creationMaterial };
