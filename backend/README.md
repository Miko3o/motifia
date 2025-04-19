# Motifa Backend

This is the backend API for the Motifa application, built with Express and TypeScript.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following content:
```
PORT=5000
```

3. Run the development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Start the production server:
```bash
npm start
```

## API Endpoints

### Words

- `GET /api/words` - Get all words
- `GET /api/words/:id` - Get a specific word by index

## Project Structure

- `index.ts` - Main server file
- `routes/` - API route definitions
- `controllers/` - Route controller logic
- `models/` - Data models
- `middleware/` - Custom middleware functions 