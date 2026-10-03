/**
 * Usage:
 *   router.post("/x", validate({ body: schema, query: schema, params: schema }), handler)
 * Parsed (and stripped/coerced) values replace the originals.
 */
const validate = (schemas = {}) => (req, res, next) => {
  try {
    if (schemas.params) req.params = schemas.params.parse(req.params);
    if (schemas.query) req.query = schemas.query.parse(req.query);
    if (schemas.body) req.body = schemas.body.parse(req.body);
    next();
  } catch (err) {
    next(err); // ZodError is handled in error.middleware
  }
};

export default validate;