import { Router } from 'express';
import {
  activateAccount,
  findUser,
  login,
  register,
  resendVerificationEmail,
  resetPassword,
  sendResetPasswordCode,
  validateResetCode,
} from '../controllers/authController.js';
import authMiddleware from '../middlewares/auth.js';

const router = Router();

router.route('/register').post(register);
router.route('/activateAccount').post(authMiddleware, activateAccount);
router.route('/login').post(login);
router
  .route('/resendVerification')
  .post(authMiddleware, resendVerificationEmail);
router.route('/findUser').post(findUser);
router.route('/sendResetCode').post(sendResetPasswordCode);
router.route('/validateResetCode').post(validateResetCode);
router.route('/resetPassword').post(resetPassword);

export default router;
