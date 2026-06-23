const z = require('zod');

/**
 * Zod validation middleware
 * Validates req.body against a Zod schema
 * Returns 400 with detailed errors if validation fails
 */
const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return res.status(400).json({ errors });
    }

    // Replace req.body with validated/coerced data
    req.body = result.data;
    next();
  };
};

module.exports = validate;