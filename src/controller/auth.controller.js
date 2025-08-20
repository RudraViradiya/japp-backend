import UserModel from "../model/use.model.js";
import validation from "../utils/validateRequest.js";
import authValidator from "../utils/validation/authValidator.js";
import { generateToken } from "../utils/common.js";
import bcrypt from "bcrypt";

const signUp = async (req, res) => {
  const data = req.body;
  try {
    const validateRequest = validation.validateParamsWithJoi(
      data,
      authValidator.creationUser
    );

    if (!validateRequest.isValid) {
      return res.badRequest({
        status: 400,
        message: `Invalid Params : ${validateRequest.message}`,
      });
    }
    const existingUser = await UserModel.findOne({ email: data.email });

    if (existingUser) {
      return res.badRequest({
        status: 409,
        message: "User with this email already exists.",
      });
    }
    const entry = new UserModel(validateRequest.value);
    await entry.save();

    const { token, refreshToken } = await generateToken(entry._id);

    return res.ok({
      status: 200,
      data: { data: entry, refreshToken, token },
      message: "User created Successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await UserModel.findOne({ email });

    if (users) {
      const validPass = await bcrypt.compare(password, users.password);

      if (validPass) {
        const { token, refreshToken } = await generateToken(users._id);

        return res.ok({
          data: { data: users, refreshToken, token },
          message: "User login Successfully",
        });
      }
    }
    return await res.badRequest({
      message: "UserName or Password Not Matched Please Re Enter..!",
    });
  } catch (error) {
    return res.failureResponse();
  }
};

export default { signUp, login };
