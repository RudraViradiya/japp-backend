import joi from "joi";

/** validation keys and properties of contact form */
const contactForm = joi
  .object({
    firstName: joi.string().required().trim(),
    lastName: joi.string().required().trim(),
    email: joi.string().required(),
    message: joi.string().required().trim(),
  })
  .unknown(true);

const updateContactStatus = joi
  .object({
    status: joi.string().valid("new", "read", "replied", "closed").required(),
  })
  .unknown(true);

export default { contactForm, updateContactStatus };
