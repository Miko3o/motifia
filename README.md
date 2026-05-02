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

### Web app

- Next.js (App Router) with React and TypeScript
- Tailwind CSS

Separate Express/MySQL backends are not included in this repository; configure `BACKEND_URL` in `.env.local` when you have an API to proxy.

## Prerequisites

- Node.js 20+ (recommended for Next.js 16)
- npm or another compatible package manager
- Optional: backend API reachable at the URL set in `.env.local` (see `.env.example`)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/motifia.git
cd motifia
```

### 2. Environment variables

From the repo root, copy `.env.example` to `.env.local` and adjust values (`BACKEND_URL`, Google client ID, authorized email).

### 3. Install dependencies and run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 .

## Project structure

```
motifia/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js routes
│   ├── components/
│   ├── contexts/
│   └── lib/
├── package.json
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

