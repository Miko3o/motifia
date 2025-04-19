import express, { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';

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

// Clean environment variables
const googleCallbackUrl = (process.env.GOOGLE_CALLBACK_URL || '').replace(/[;'"]/g, '');
const corsOrigin = (process.env.CORS_ORIGIN || '').replace(/[;'"]/g, '');

// Debug environment variables
console.log('Auth environment variables:', {
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
  GOOGLE_CALLBACK_URL: googleCallbackUrl,
  AUTHORIZED_EMAIL: process.env.AUTHORIZED_EMAIL ? 'Set' : 'Not set',
  CORS_ORIGIN: corsOrigin
});

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl
);

// Check if user is authenticated
router.get('/check', (req: Request, res: Response) => {
  console.log('Auth check request:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    user: req.session?.user,
    cookies: req.headers.cookie
  });

  if (req.session && req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// Handle Google OAuth callback
router.post('/google', async (req: Request, res: Response) => {
  const { code } = req.body;
  console.log('Google auth request received with code');

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
    console.log('Google auth payload:', {
      email: payload?.email,
      name: payload?.name,
      hasPicture: !!payload?.picture
    });

    if (!payload || !payload.email || !payload.name || !payload.picture) {
      throw new Error('Missing required user information');
    }

    // Check if user is authorized
    if (payload.email !== process.env.AUTHORIZED_EMAIL) {
      console.log('Unauthorized email:', payload.email);
      return res.status(403).json({ error: 'Unauthorized email' });
    }

    // Store user info in session
    req.session.user = {
      email: payload.email,
      name: payload.name,
      picture: payload.picture
    };

    // Save session explicitly and wait for it to complete
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          reject(err);
        } else {
          resolve();
        }
      });
    });

    console.log('User authenticated successfully:', {
      email: payload.email,
      sessionID: req.sessionID,
      cookies: req.headers.cookie,
      user: req.session.user
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  console.log('Logout request:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    cookies: req.headers.cookie
  });

  req.session.destroy((err: Error | null) => {
    if (err) {
      console.error('Logout error:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('motifia.sid');
    res.json({ success: true });
  });
});

export default router; 