module.exports = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // Replace with sanitized values
    req.body = parsed.body;
    req.params = parsed.params;
    req.query = parsed.query;

    next();
  } catch (err) {
    return res.status(400).json({
      message: err.errors?.[0]?.message || 'Invalid request data',
    });
  }
};
