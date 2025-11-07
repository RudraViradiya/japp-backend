import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const jwtExpiry = process.env.JWTEXPIRY || 8;
const jwtRefreshExpiry = process.env.JWT_REFRESH_EXPIRY || 1440;
const secretKey = process.env.SECRET_KEY;

/**
 * @description : service to generate JWT token for authentication.
 * @param {String} userid : id of the user.
 * @return {string}  : returns JWT token.
 */
const generateToken = async (userId) => {
  const token = jwt.sign(
    {
      userId,
    },
    secretKey,
    { expiresIn: jwtExpiry * 60000 }
  );

  const refreshToken = jwt.sign(
    {
      userId,
    },
    secretKey,
    { expiresIn: jwtRefreshExpiry * 60 }
  );

  return { token, refreshToken };
};

/**
 *
 * @param {String} str String that needs to be checked if empty or not
 * @returns
 *
 * Works only for string and number
 */
const isEmpty = (str) => !str || str.length === 0;

/**
 *
 * @param {String} str date in string format
 * @returns
 */
const validDate = (str) => {
  if (!str || str.length === 0) {
    return false;
  }
  try {
    new Date(str);
    return true;
  } catch (err) {
    return false;
  }
};

/**
 *
 * @param {String} id String that needs to be checked for the id
 * @returns
 */
const isValidObjectId = (id) => {
  if (!id || id.length === 0) {
    return false;
  }

  if (id.toString().match(/^[0-9a-fA-F]{24}$/)) {
    return true;
  }
  return false;
};

/**
 *
 * @param {Number} page this is the current pageNo
 * @param {Number} limit this is the limit of items per page
 * @returns {Array} 0: limit, 1: pageNo, 2: skipsize
 */
const getLimitAndSkipSize = (page, limitPerPage) => {
  let pageNo = parseInt(page, 10);

  if (!pageNo) {
    pageNo = 1;
  }

  let limit = parseInt(limitPerPage, 10);
  if (!limit) {
    limit = 10;
  }

  const skipSize = (pageNo - 1) * limit;
  return [pageNo, limit, skipSize];
};

/**
 *
 * @param {String} numberCode Country mobile code for the number
 * @param {String} number Number to whom otp is to be sent
 * @param {Array} testNumbers List of numbers to exclude
 * @returns
 */
// const generateOtp = (numberCode, number, testNumbers) => {
//   const ENV = process.env.ENV;
//   let otp = Math.floor(Math.random() * 100000) + 100000;
//   if (ENV == 'DEV') {
//     otp = '999999';
//   }
//   if (testNumbers.includes(number)) {
//     otp = '999999';
//   }

//   new Otp({ otp: otp, number: number, numberCode: numberCode }).save();

//   return otp;
// };

/**
 *
 * @param {String} str String that needs to be checked if empty or not
 * @returns
 *
 * Works only for string and number
 */
const isHttpsLink = (str) => {
  if (!str || str.length === 0) {
    return false;
  }
  return /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/.test(
    str
  );
};

/**
 *
 * @param {Any} object This is the object that needs to be converted into the enum
 * @returns
 *
 * Works only for string and number
 */
const convertObjectToEnum = (object) => Object.entries(object).map((e) => e[1]);

const saveBase64Image = (base64String, pathName, fileName) =>
  new Promise((res, rej) => {
    const binaryBuffer = base64String.split(";base64,").pop();
    const filePath = path.join(__dirname, pathName, `${fileName}.png`);
    fs.writeFile(
      filePath,
      binaryBuffer,
      { encoding: "base64" },
      function (err) {
        if (err === null) {
          res();
        } else {
          rej();
        }
      }
    );
  });

export {
  generateToken,
  isEmpty,
  validDate,
  isValidObjectId,
  getLimitAndSkipSize,
  isHttpsLink,
  convertObjectToEnum,
  saveBase64Image,
};
