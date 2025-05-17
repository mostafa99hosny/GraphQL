const jwt = require('jsonwebtoken');

module.exports = (req) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return {};
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { userId: payload.userId };
  } catch {
    return {};
  }
};
