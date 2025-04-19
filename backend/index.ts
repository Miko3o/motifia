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
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: true,
  saveUninitialized: false,
  store: sessionStore,
  name: 'motifia.sid',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    domain: process.env.NODE_ENV === 'production' ? corsDomain : undefined,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
};

console.log('Session configuration:', {
  secure: sessionConfig.cookie.secure,
  sameSite: sessionConfig.cookie.sameSite,
  domain: sessionConfig.cookie.domain,
  name: sessionConfig.name
});

// Middleware
app.set('trust proxy', 1); // trust first proxy

app.use(cors({
  origin: corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

app.use(express.json());
app.use(cookieParser());
app.use(session(sessionConfig));

// Debug middleware to log session info
app.use((req, res, next) => {
  // Clean request headers
  const origin = req.headers.origin?.replace(/[;'"]/g, '');
  const referer = req.headers.referer?.replace(/[;'"]/g, '');

  console.log('Request:', {
    path: req.path,
    method: req.method,
    sessionID: req.sessionID,
    hasSession: !!req.session,
    hasUser: !!req.session?.user,
    cookies: req.headers.cookie,
    origin,
    referer,
    'x-forwarded-proto': req.headers['x-forwarded-proto'],
    'x-forwarded-host': req.headers['x-forwarded-host']
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