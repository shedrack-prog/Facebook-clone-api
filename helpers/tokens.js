import jwt from 'jsonwebtoken';

export const createToken = (payload, expired) => {
  return jwt.sign(payload, process.env.CREATE_TOKEN_SECRET, {
    expiresIn: expired,
  });
};
