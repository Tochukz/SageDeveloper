const { body, validationResult } = require("express-validator");

function validator(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const message = Array.from(
      new Set(errors.array().map((err) => `${err.msg}`))
    ).join(", ");
    const error = new Error(message);
    error.status = 400;
    return next(error);
  }
  return next();
}

const postContactValidator = [
  body("name").notEmpty().withMessage("name field is required"),
  body("contact_type_ids")
    .isArray()
    .withMessage("contact_type_ids must be an array"),
  validator,
];

module.exports = {
  postContactValidator,
};
