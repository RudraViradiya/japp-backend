import joi from "joi";

/** validation keys and properties of user */
const creationModel = joi
  .object({
    name: joi.string().required(),
    sku: joi.string().required(),
    type: joi.string().required(),
    note: joi.string().optional().allow(""),
    modelUrl: joi.string(),
    thumbnail: joi.string(),
    modelConfig: joi.string().required(),
  })
  .unknown(true);

export default { creationModel };
