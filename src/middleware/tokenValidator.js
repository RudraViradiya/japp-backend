/* eslint-disable no-underscore-dangle */

import jwt from "jsonwebtoken";
import UserTokenModel from "../model/userToken.model.js";

const secretKey = process.env.SECRET_KEY;

export const fetchDecodedToken = (req) => {
  try {
    const token = req.header("authorization");
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), secretKey);
    return decoded; // Handle different token structures
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

export const checkTokenValidity = async (token) =>
  new Promise((res, rej) => {
    (async () => {
      try {
        const decoded = jwt.verify(token, secretKey);

        if (decoded) {
          res(decoded.userId);
        } else {
          rej("Your token is expired");
        }
      } catch (err) {
        console.log("🚀 - err:", err);
        rej("Your token is expired");
      }
    })();
  });

const tokenValidator = async (req, res, next) => {
  try {
    const rawToken = req.header("authorization");

    if (!rawToken) {
      return res.unAuthorizedRequest({ message: "Token Not Found..." });
    }

    const token = rawToken.replace("Bearer ", "").trim();

    const userId = await checkTokenValidity(token);
    if (!userId) {
      return res.unAuthorizedRequest({ message: "Invalid Token" });
    }

    const tokenDoc = await UserTokenModel.findOne({
      userId,
      tokens: token,
    });

    if (!tokenDoc) {
      return res.unAuthorizedRequest({
        message: "Token Expired",
      });
    }

    req.userId = userId;

    next();
  } catch (err) {
    return res.unAuthorizedRequest({ message: err?.message || "Unauthorized" });
  }
};

export default tokenValidator;
