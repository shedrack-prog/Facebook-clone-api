import {
  validateEmail,
  validateLength,
  validateUsername,
} from '../helpers/validations.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import { BadRequestError } from '../errors/index.js';
import { createToken } from '../helpers/tokens.js';
import { sendVerificationEmail } from '../helpers/mailer.js';
import jwt from 'jsonwebtoken';
import Code from '../models/Code.js';
import { generateResetCode } from '../helpers/generateCode.js';

const register = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      username,
      email,
      password,
      bYear,
      bMonth,
      bDay,
      gender,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !bYear ||
      !bMonth ||
      !bDay ||
      !gender
    ) {
      return res.status(400).json({ message: 'Please provide all values' });
    }

    if (!validateEmail(email)) {
      // throw new BadRequestError('Invalid email address');
      return res.status(400).json({ message: 'Invalid Email address' });
    }

    const alreadyExist = await User.findOne({ email });

    if (alreadyExist) {
      return res.status(400).json({
        message: 'Email already in use by another user, Try a different one!',
      });
    }
    if (!validateLength(first_name, 3, 30)) {
      return res
        .status(400)
        .json({ message: 'first name must be between 3 and 30 characters' });
    }

    if (!validateLength(last_name, 3, 40)) {
      return res
        .status(400)
        .json({ message: 'last name must be between 3 and 30 characters' });
    }

    if (!validateLength(password, 6, 30)) {
      return res
        .status(400)
        .json({ message: 'password must be at least 6 characters' });
    }

    const salt = await bcrypt.genSalt(12);

    const cryptedPassword = await bcrypt.hash(password, salt);
    let tempUsername = first_name + last_name;
    let newUsername = await validateUsername(tempUsername);

    const user = await new User({
      first_name,
      last_name,
      username: newUsername,
      email,
      password: cryptedPassword,
      bYear,
      bMonth,
      bDay,
      gender,
    }).save();
    const emailVerificationToken = createToken({ id: user._id }, '30m');
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);

    const token = createToken({ id: user.id }, '7d');
    res.status(201).json({
      id: user._id,
      first_name: user.first_name,
      username: user.username,
      last_name: user.last_name,
      picture: user.picture,
      token: token,
      verified: user.verified,
      message:
        'Account created! check your email to activate and continue. The verification link will expire in 30 minutes',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const activateAccount = async (req, res) => {
  try {
    const { token } = req.body;
    const validUser = req.user.id;
    const payload = jwt.verify(token, process.env.CREATE_TOKEN_SECRET);
    const user = await User.findById(payload.id);
    if (validUser !== payload.id) {
      return res
        .status(401)
        .json({ message: 'You are not Authorized to perform this operation' });
    }
    if (user.verified == true) {
      return res
        .status(400)
        .json({ message: 'This account is already activated' });
    } else {
      await User.findByIdAndUpdate(payload.id, { verified: true });
      return res
        .status(200)
        .json({ message: 'Account has been activated successfully' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Please provide email and password' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'No user found with this Email' });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Incorrect Password' });
    }

    const token = createToken({ id: user.id }, '7d');
    res.status(201).json({
      id: user._id,
      first_name: user.first_name,
      username: user.username,
      last_name: user.last_name,
      picture: user.picture,
      token: token,
      verified: user.verified,
      message: 'Login successful!!',
    });
  } catch (error) {}
};
const resendVerificationEmail = async (req, res) => {
  try {
    const { id } = req.user;
    const user = await User.findById(id);
    if (user.verified === true) {
      return res
        .status(400)
        .json({ message: 'This Account has already been activated' });
    }
    const emailVerificationToken = createToken({ id: user._id }, '30m');
    const url = `${process.env.BASE_URL}/activate/${emailVerificationToken}`;
    sendVerificationEmail(user.email, user.first_name, url);

    res.status(200).json({ message: 'Email verification link has been sent' });
  } catch (error) {
    return res.status(500).json({ message: error.response.message });
  }
};

const findUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your Email' });
    }

    const user = await User.findOne({ email }).select('-password');

    if (!user) {
      return res
        .status(400)
        .json({ message: 'Account not found with this Email' });
    }
    return res.status(200).json({
      email: user.email,
      picture: user.picture,
    });
  } catch (error) {
    return res.status(500).json({ message: error.response.message });
  }
};

const sendResetPasswordCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await User.findOne({ email }).select('-password');
    await Code.findOneAndRemove({ user: user._id });

    const code = generateResetCode(5);
    const newCode = await new Code({
      code,
      user: user._id,
    }).save();
    console.log(code);

    return res.status(200).json({
      message: 'Password reset code has been sent to your Email',
    });
  } catch (error) {
    return res.status(500).json({ message: error.response.message });
  }
};

const validateResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res
        .status(400)
        .json({ message: 'Please provide your email and code' });
    }
    const user = await User.findOne({ email });
    const DbCode = await Code.findOne({ user: user._id });
    if (DbCode.code !== code) {
      return res.status(400).json({ message: 'Verification code is Invalid' });
    }
    return res.status(200).json({ message: 'OK' });
  } catch (error) {
    res.status(500).json({ message: error.response.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { email, password, confPassword } = req.body;

    if (password !== confPassword) {
      return res.status(400).json({ message: 'passwords must match' });
    }
    const cryptedPassword = await bcrypt.hash(password, 12);
    const user = await User.findOneAndUpdate(
      { email },
      { password: cryptedPassword }
    );
    res.status(200).json({ message: 'success' });
  } catch (error) {
    return res.status(500).json({ message: error.response.message });
  }
};

export {
  register,
  activateAccount,
  login,
  resendVerificationEmail,
  findUser,
  sendResetPasswordCode,
  validateResetCode,
  resetPassword,
};
