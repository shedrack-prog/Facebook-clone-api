import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer')) {
      return res.status(401).json({ message: 'Invalid Authentication' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.CREATE_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.status(400).json({ message: 'Invalid Authentication' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    return res.status(500).json({ message: error.response.message });
  }
};

export default auth;
