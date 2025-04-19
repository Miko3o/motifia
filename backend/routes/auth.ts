import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import session from 'express-session';

dotenv.config();

// Extend Express Session interface
declare module 'express-session' {
  interface SessionData {
    user: {
      email: string;
      name: string;
      picture: string;
    };
  }
}

const router = express.Router();
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5173/admin/callback'
);

// Check if user is authenticated
router.get('/check', (req: Request, res: Response) => {
  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Handle Google OAuth callback
router.post('/google', async (req: Request, res: Response) => {
  const { code } = req.body;

  try {
    // Exchange code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token!,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.name || !payload.picture) {
      throw new Error('Missing required user information');
    }

    // Check if user is authorized
    if (payload.email !== process.env.AUTHORIZED_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized email' });
    }

    // Store user info in session
    req.session.user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    res.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err: Error | null) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

export default router; 