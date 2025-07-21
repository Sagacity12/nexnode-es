import { Router } from 'express';
import {
  register,
  verifyEmail,
  loginUser as Login,
  generateLoginOTP,
  verifyLoginOTP,
  googleLogin,
  linkGoogle,
  unlinkGoogle,
  requestPasswordResetController,
  verifyPasswordResetController,
  resetPasswordController,
  changePasswordController,
  resendOTPController,
  logout,
} from "../controllers/authcontroler";
import { authMiddleware } from "../middleware/authmiddleware";


const router = Router();



router.post('/register', register);
router.post('/verify-email',  verifyEmail);
router.post('/login', Login);
router.post('/generate-login-otp', generateLoginOTP);
router.post('/verify-login-otp', verifyLoginOTP);
router.post('/google-login', googleLogin);
router.post('/link-google', authMiddleware, linkGoogle);
router.post('/unlink-google', authMiddleware, unlinkGoogle);
router.post('/request-password-reset', requestPasswordResetController);
router.post('/verify-password-reset', verifyPasswordResetController);
router.post('/reset-password', resetPasswordController);
router.post('/change-password', authMiddleware, changePasswordController);
router.post('/resend-otp', resendOTPController);
router.post('/logout', authMiddleware, logout);

export default router;