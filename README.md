# Motifia

Motifia is a musical language where words are expressed as musical motifs that can be played on any instrument. Unlike traditional spoken languages, Motifia is designed to be "spoken" entirely through music, creating a unique form of communication that transcends linguistic barriers.

Each word in Motifia is represented by a distinct musical pattern or motif, allowing for expressive communication through melody, rhythm, and harmony. The language incorporates robust grammatical structures based on music theory principles, where different musical elements convey meaning, tense, mood, and other linguistic features.

This web application serves as both a dictionary and learning platform for Motifia, helping users discover, understand, and practice this musical language.

## Features

- **Word Dictionary**: Browse and search through a curated collection of words
- **Musical Motifs**: Each word is associated with a unique musical pattern
- **Word Requests**: Users can request new words to be added to the dictionary
- **Admin Queue**: Administrators can review and approve/reject word requests
- **Google Authentication**: Secure login system using Google OAuth
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

### Frontend
- React with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation

### Backend
- Node.js with Express
- TypeScript
- MySQL database
- Google OAuth for authentication
- Express Session for session management

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- Google OAuth credentials
- npm or yarn package manager

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/motifia.git
cd motifia
```

### 2. Set up the database

Create a MySQL database named `motifia`:

```sql
CREATE DATABASE motifia;
```

### 3. Configure environment variables

#### Frontend
Copy the example environment file and update it with your values:

```bash
cd frontend
cp .env.example .env
```

Update the following variables in `frontend/.env`:
- `VITE_API_URL`: Backend API URL
- `VITE_GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `VITE_AUTHORIZED_EMAIL`: Email address authorized to access the admin features

#### Backend
Copy the example environment file and update it with your values:

```bash
cd backend
cp .env.example .env
```

Update the following variables in `backend/.env`:
- Database configuration (host, user, password, etc.)
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: Your Google OAuth credentials
- `SESSION_SECRET`: A random string for session encryption
- `AUTHORIZED_EMAIL`: Email address authorized to access the admin features

### 4. Install dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 5. Start the development servers

```bash
# Start the backend server
cd backend
npm run dev

# Start the frontend development server
cd frontend
npm run dev
```

The application should now be running at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
motifia/
├── frontend/               # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service functions
│   │   └── types/         # TypeScript type definitions
│   └── public/            # Static assets
├── backend/               # Backend Node.js application
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── models/        # Database models
│   │   ├── middleware/    # Express middleware
│   │   └── types/         # TypeScript type definitions
│   └── config/            # Configuration files
└── README.md              # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

