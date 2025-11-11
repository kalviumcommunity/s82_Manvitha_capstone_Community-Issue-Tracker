const jwt = require("jsonwebtoken");

exports.sign = (payload, expiresIn = "1d") => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

exports.verify = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
