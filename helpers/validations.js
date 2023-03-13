import User from '../models/User.js';

export const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(/^([a-z\d\.-]+)@([a-z\d-]+)\.([a-z]{2,12})(\.[a-z]{2.12})?$/);
};

export const validateLength = (str, min, max) => {
  if (str.length > max || str.length < min) {
    return false;
  }
  return true;
};

export const validateUsername = async (username) => {
  let a = false;

  do {
    const user = await User.findOne({ username });
    if (user) {
      username += (+new Date() * Math.random()).toString().substring(0, 1);
      a = true;
    } else {
      a = false;
    }
  } while (a);
  return username;
};
