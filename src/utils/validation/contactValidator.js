import joi from "joi";

/** validation keys and properties of contact form */
const contactForm = joi
  .object({
    firstName: joi.string().required().min(2).max(50).trim(),
    lastName: joi.string().required().min(2).max(50).trim(),
    email: joi.string().email().required().trim(),
    message: joi.string().required().min(10).max(1000).trim(),
  })
  .unknown(true);

const updateContactStatus = joi
  .object({
    status: joi.string().valid('new', 'read', 'replied', 'closed').required(),
  })
  .unknown(true);

export default { contactForm, updateContactStatus };
