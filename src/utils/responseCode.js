/**
 * responseCode.js
 * @description :: exports all response codes for APIS.
 */

const success = 200;
const badRequest = 400;
const unAuthorizedRequest = 401;
const accessForbidden = 403;
const notFound = 404;
const validationError = 422;
const internalServerError = 500;

export default {
  success,
  badRequest,
  unAuthorizedRequest,
  accessForbidden,
  notFound,
  validationError,
  internalServerError,
};
