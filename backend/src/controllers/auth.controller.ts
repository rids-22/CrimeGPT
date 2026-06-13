import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, queryOne } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { logAction } from '../services/audit.service';

const JWT_SECRET = process.env.JWT_SECRET || 'crimegpt_secret_key_2026';

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

    const payload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      police_station: user.police_station
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });

    await logAction(user.id, user.username, 'User logged in', { role: user.role });

    return res.status(200).json({
      token,
      user: payload
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { username, password, name, role, police_station, role_credential } = req.body;

    if (!username || !password || !name || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      'INSERT INTO users (username, password_hash, name, role, police_station, role_credential) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [username, password_hash, name, role, police_station || '', role_credential]
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
