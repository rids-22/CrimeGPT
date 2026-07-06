import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { logAction } from '../services/audit.service';
import { sendOtpEmail, isEmailConfigured } from '../services/email.service';

const JWT_SECRET = process.env.JWT_SECRET || 'crimegpt_secret_key_2026';
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_MAX_ATTEMPTS = 5;

// In-memory OTP store, keyed by username. This is intentionally not persisted to the
// database: OTPs are short-lived, single-use, and only ever needed by this running
// server process during the ~5 minute login window.
interface PendingOtp {
  otp: string;
  expiresAt: number;
  attempts: number;
  userId: number;
}
const otpStore = new Map<string, PendingOtp>();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function issueSessionToken(user: any) {
  const payload = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    police_station: user.police_station
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
  return { token, payload };
}

// Enforces a minimum password strength on registration: at least 8 characters,
// one uppercase, one lowercase, one digit, and one special character.
// Mirrors the client-side check in Login.tsx, but this is the copy that actually
// matters since the frontend check alone can be bypassed by calling the API directly.
const isStrongPassword = (pw: string): boolean => {
  return (
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /\d/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
};

const validateRoleCredential = (role: string, credential?: string): { valid: boolean; error?: string } => {
  if (!credential) {
    return { valid: false, error: 'Role security credential is required' };
  }
  if (role === 'IO') {
    if (!/^IO-\d{5}$/.test(credential)) {
      return { valid: false, error: 'IO Badge ID must follow the pattern IO-XXXXX (e.g., IO-10293)' };
    }
  } else if (role === 'SHO') {
    if (!/^PS-\d{4}$/.test(credential)) {
      return { valid: false, error: 'SHO Station Code must follow the pattern PS-XXXX (e.g., PS-4001)' };
    }
  } else if (role === 'LEGAL_ADVISOR') {
    if (!/^BC-\d{4}\/\d{2}$/.test(credential)) {
      return { valid: false, error: 'Legal Advisor Bar Council Registration must follow the pattern BC-XXXX/XX (e.g., BC-1234/56)' };
    }
  } else if (role === 'ADMIN') {
    if (!/^ADM-\d{5}$/.test(credential)) {
      return { valid: false, error: 'Admin Security Clearance Code must follow the pattern ADM-XXXXX (e.g., ADM-99182)' };
    }
  } else {
    return { valid: false, error: 'Invalid user role selected' };
  }
  return { valid: true };
};

export async function login(req: Request, res: Response) {
  try {
    const { username, password, role, role_credential } = req.body;

    if (!username || !password || !role || !role_credential) {
      return res.status(400).json({ error: 'Username, password, role, and security credential are required' });
    }

    const user = await queryOne('SELECT * FROM users WHERE username = $1', [username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username, password, or credentials' });
    }

    if (user.role !== role) {
      return res.status(401).json({ error: 'Selected role does not match this account' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Verify role security credential match
    if (user.role_credential && user.role_credential.toLowerCase() !== role_credential.trim().toLowerCase()) {
      return res.status(401).json({ error: 'Secret role credential code does not match database record' });
    }

    // Credentials are valid — now require a second factor before issuing a session token.
    const otp = generateOtp();
    otpStore.set(username, {
      otp,
      expiresAt: Date.now() + OTP_TTL_MS,
      attempts: 0,
      userId: user.id
    });

    let emailSent = false;
    if (user.email) {
      emailSent = await sendOtpEmail(user.email, otp, user.name);
    }

    await logAction(user.id, user.username, 'Login credentials verified, OTP issued', { role: user.role });

    const response: any = {
      mfaRequired: true,
      username: user.username,
      maskedEmail: user.email ? user.email.replace(/^(.{2}).+(@.+)$/, '$1***$2') : null,
      emailSent
    };

    // If SMTP isn't configured (e.g. local dev, or a hackathon demo without an email
    // service set up), surface the OTP directly so the app stays fully testable.
    // This never happens in production, and never happens if a real email was sent.
    if (!emailSent && process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function verifyOtp(req: Request, res: Response) {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({ error: 'Username and OTP code are required' });
    }

    const pending = otpStore.get(username);
    if (!pending) {
      return res.status(400).json({ error: 'No pending verification for this account. Please log in again.' });
    }

    if (Date.now() > pending.expiresAt) {
      otpStore.delete(username);
      return res.status(400).json({ error: 'This code has expired. Please log in again to receive a new one.' });
    }

    if (pending.attempts >= OTP_MAX_ATTEMPTS) {
      otpStore.delete(username);
      return res.status(429).json({ error: 'Too many incorrect attempts. Please log in again to receive a new code.' });
    }

    if (pending.otp !== otp.toString().trim()) {
      pending.attempts += 1;
      return res.status(401).json({ error: `Incorrect code. ${OTP_MAX_ATTEMPTS - pending.attempts} attempt(s) remaining.` });
    }

    // OTP correct — clean up and issue the real session token.
    otpStore.delete(username);
    const user = await queryOne('SELECT * FROM users WHERE id = $1', [pending.userId]);
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }

    const { token, payload } = issueSessionToken(user);
    await logAction(user.id, user.username, 'User logged in (MFA verified)', { role: user.role });

    return res.status(200).json({ token, user: payload });
  } catch (err: any) {
    console.error('OTP verification error:', err);
    return res.status(500).json({ error: 'Internal server error during OTP verification' });
  }
}

export async function resendOtp(req: Request, res: Response) {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const pending = otpStore.get(username);
    if (!pending) {
      return res.status(400).json({ error: 'No pending verification for this account. Please log in again.' });
    }

    const user = await queryOne('SELECT * FROM users WHERE id = $1', [pending.userId]);
    if (!user) {
      return res.status(401).json({ error: 'Account no longer exists' });
    }

    const otp = generateOtp();
    otpStore.set(username, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0, userId: user.id });

    let emailSent = false;
    if (user.email) {
      emailSent = await sendOtpEmail(user.email, otp, user.name);
    }

    const response: any = { resent: true, emailSent };
    if (!emailSent && process.env.NODE_ENV !== 'production') {
      response.devOtp = otp;
    }

    return res.status(200).json(response);
  } catch (err: any) {
    console.error('Resend OTP error:', err);
    return res.status(500).json({ error: 'Internal server error while resending code' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { username, password, name, email, role, police_station, role_credential } = req.body;

    if (!username || !password || !name || !role || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Enter a valid email address — MFA codes are sent here at login.' });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character.'
      });
    }

    // Validate role security credential format
    const checkCred = validateRoleCredential(role, role_credential);
    if (!checkCred.valid) {
      return res.status(400).json({ error: checkCred.error });
    }

    const existingUser = await queryOne('SELECT id FROM users WHERE username = $1', [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const result = await query(
      'INSERT INTO users (username, password_hash, name, email, role, police_station, role_credential) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [username, password_hash, name, email, role, police_station || '', role_credential]
    );

    const newUserId = result.rows[0]?.id || 1;

    // Log the creation
    await logAction(
      null,
      'REGISTRATION_PORTAL',
      `Registered user ${username}`,
      { name, role, police_station }
    );

    return res.status(201).json({
      message: 'User registered successfully',
      userId: newUserId
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
}

export async function getProfile(req: Request, res: Response) {
  try {
    const user = (req as AuthRequest).user;
    if (!user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.status(200).json({ user });
  } catch (err: any) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const users = await query('SELECT id, username, name, role, police_station, created_at FROM users ORDER BY name ASC');
    return res.status(200).json(users.rows);
  } catch (err: any) {
    console.error('Get users error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
