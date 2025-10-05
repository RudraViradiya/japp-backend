import ContactModel from "../model/contact.model.js";
import validation from "../utils/validateRequest.js";
import contactValidator from "../utils/validation/contactValidator.js";

export const createContact = async (req, res) => {
  const data = req.body;
  try {
    const validateRequest = validation.validateParamsWithJoi(
      data,
      contactValidator.contactForm
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const contact = new ContactModel({
      ...validateRequest.value,
    });
    
    await contact.save();

    return res.ok({
      status: 201,
      data: contact,
      message: "Contact message sent successfully",
    });
  } catch (error) {
    console.error("Create Contact Error:", error);
    return res.failureResponse();
  }
};

export const getContacts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const filter = {};
    if (status) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await ContactModel.paginate(filter, {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { createdAt: -1 }
    });

    return res.ok({
      status: 200,
      data: contacts,
      message: "Contacts fetched successfully",
    });
  } catch (error) {
    console.error("Get Contacts Error:", error);
    return res.failureResponse();
  }
};

export const getContactById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await ContactModel.findById(id);
    
    if (!contact) {
      return res.badRequest({
        status: 404,
        message: "Contact not found",
      });
    }

    return res.ok({
      status: 200,
      data: contact,
      message: "Contact fetched successfully",
    });
  } catch (error) {
    console.error("Get Contact By ID Error:", error);
    return res.failureResponse();
  }
};

export const updateContactStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const validateRequest = validation.validateParamsWithJoi(
      data,
      contactValidator.updateContactStatus
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }

    const contact = await ContactModel.findByIdAndUpdate(
      id,
      { status: validateRequest.value.status },
      { new: true }
    );

    if (!contact) {
      return res.badRequest({
        status: 404,
        message: "Contact not found",
      });
    }

    return res.ok({
      status: 200,
      data: contact,
      message: "Contact status updated successfully",
    });
  } catch (error) {
    console.error("Update Contact Status Error:", error);
    return res.failureResponse();
  }
};

export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    
    const contact = await ContactModel.findByIdAndDelete(id);
    
    if (!contact) {
      return res.badRequest({
        status: 404,
        message: "Contact not found",
      });
    }

    return res.ok({
      status: 200,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    console.error("Delete Contact Error:", error);
    return res.failureResponse();
  }
};
