import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, register, getProfile, getUsers, verifyOtp, resendOtp } from '../controllers/auth.controller';
import { authenticateToken, requireRoles } from '../middleware/auth';

const router = Router();

// Limits brute-force attempts on credentials: 10 tries per IP per 15 minutes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many attempts from this IP. Please try again in 15 minutes.' }
});

// Tighter limit on OTP verification: a 6-digit code has a small keyspace,
// so brute-forcing must be capped harder than a normal login attempt.
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many verification attempts from this IP. Please try again in 15 minutes.' }
});

router.post('/login', authLimiter, login);
router.post('/verify-otp', otpLimiter, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/register', authLimiter, register);
router.get('/profile', authenticateToken, getProfile);
// Restricted to ADMIN/SHO: prevents any authenticated role (e.g. IO) from pulling the full user directory.
router.get('/users', authenticateToken, requireRoles(['ADMIN', 'SHO']), getUsers);

export default router;
