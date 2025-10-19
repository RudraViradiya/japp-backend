import joi from "joi";

/** validation keys and properties of user */
const creationVideoAngle = joi
  .object({
    name: joi.string().required(),
    data: joi.object().required(),
  })
  .unknown(true);

export default { creationVideoAngle };
