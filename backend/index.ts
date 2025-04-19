import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import cookieParser from 'cookie-parser';
import wordsRouter from './routes/words';
import authRouter from './routes/auth';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Clean environment variables
const corsOrigin = (process.env.CORS_ORIGIN || 'http://localhost:5173').replace(/[;'"]/g, '');
console.log('Cleaned CORS Origin:', corsOrigin);

// Configure MySQL session store
const MySQLSession = MySQLStore(session);
const sessionStore = new MySQLSession({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
});

// Parse domain from CORS origin
const corsDomain = new URL(corsOrigin).hostname;
console.log('CORS domain:', corsDomain);

// Session configuration
const isProduction = process.env.NODE_ENV === 'production';
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: false,
  store: sessionStore,
  name: 'motifia.sid',
  cookie: {
    secure: isProduction, // Only require secure in production
    httpOnly: true,
    sameSite: isProduction ? 'none' as const : 'lax' as const,
    domain: isProduction ? undefined : undefined, // Let browser handle domain in both environments
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

console.log('Session configuration:', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  domain: sessionConfig.cookie.domain,
  name: sessionConfig.name,
  isProduction
});

// Middleware
if (isProduction) {
  app.set('trust proxy', 1); // trust first proxy
}

// CORS configuration
app.use((req, res, next) => {
  // Set CORS headers for all responses
  res.header('Access-Control-Allow-Origin', corsOrigin);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());
app.use(cookieParser());
app.use(session(sessionConfig));

// Debug middleware to log session info
app.use((req, res, next) => {
  // Clean request headers
  const origin = req.headers.origin?.replace(/[;'"]/g, '');
  const referer = req.headers.referer?.replace(/[;'"]/g, '');

  console.log('Request details:', {
    path: req.path,
    method: req.method,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    cookies: req.headers.cookie,
    origin,
    referer,
    'x-forwarded-proto': req.headers['x-forwarded-proto'],
    'x-forwarded-host': req.headers['x-forwarded-host'],
    'x-forwarded-for': req.headers['x-forwarded-for'],
    host: req.headers.host,
    'user-agent': req.headers['user-agent'],
    'sec-fetch-site': req.headers['sec-fetch-site'],
    'sec-fetch-mode': req.headers['sec-fetch-mode'],
    'sec-fetch-dest': req.headers['sec-fetch-dest']
  });

  // Log response headers after the request is complete
  res.on('finish', () => {
    console.log('Response details:', {
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      sessionID: req.sessionID,
      hasSession: !!req.session,
      hasUser: !!req.session?.user,
      cookies: req.headers.cookie
    });
  });

  next();
});

// Routes
app.use('/api/words', wordsRouter);
app.use('/api/auth', authRouter);

// Add health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Welcome to the Motifa API' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 