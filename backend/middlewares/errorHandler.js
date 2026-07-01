module.exports = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  // Log full error only in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  res.status(statusCode).json({
    message: err.message || 'Internal Server Error',
  });
};
