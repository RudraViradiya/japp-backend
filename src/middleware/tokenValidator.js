/* eslint-disable no-underscore-dangle */

import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export const fetchDecodedToken = (req) => {
  try {
    const token = req.header("authorization");
    if (!token) {
      throw new Error("No token provided");
    }

    const decoded = jwt.verify(token.replace("Bearer ", ""), secretKey);
    console.log("🚀 - fetchDecodedToken - decoded:", decoded);
    return decoded; // Handle different token structures
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};

const checkTokenValidity = async (token) =>
  new Promise((res, rej) => {
    (async () => {
      try {
        console.log("🚀 - decoded:", token, secretKey);
        const decoded = jwt.verify(token, secretKey);

        if (decoded) {
          res(true);
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
  const token = req.header("authorization");

  if (!token) {
    return res.unAuthorizedRequest({ message: "Token Not Found...." });
  }

  checkTokenValidity(token.replace("Bearer ", ""))
    .then(async (result) => {
      next();
    })
    .catch((err) => res.unAuthorizedRequest({ message: err }));

  return undefined;
};

export default tokenValidator;
