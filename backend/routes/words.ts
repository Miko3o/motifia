import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// Get all words
router.get('/', async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query('SELECT * FROM words ORDER BY word ASC');
    // Ensure we always return an array
    res.json(Array.isArray(rows) ? rows : []);
  } catch (error) {
    console.error('Error fetching words:', error);
    // Return empty array instead of error to prevent frontend mapping issues
    res.json([]);
  }
});

// Get a specific word by word name
router.get('/word/:word', async (req: Request, res: Response) => {
  try {
    const word = decodeURIComponent(req.params.word.toLowerCase());
    const [rows]: any = await pool.query(
      'SELECT * FROM words WHERE LOWER(word) = ?',
      [word]
    );
    
    if (!Array.isArray(rows) || rows.length === 0) {
      res.status(404).json({ message: 'Word not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error('Error fetching word:', error);
    res.status(500).json({ message: 'Error fetching word' });
  }
});

// Add a new word
router.post('/', async (req: Request, res: Response) => {
  const { word, part_of_speech, motif, mnemonic } = req.body;
  const lowerWord = word.toLowerCase();
  
  if (!lowerWord) {
    return res.status(400).json({ message: 'Word is required' });
  }

  try {
    // Check if word already exists
    const [existing]: any = await pool.query(
      'SELECT id FROM words WHERE LOWER(word) = ?',
      [lowerWord]
    );

    if (Array.isArray(existing) && existing.length > 0) {
      return res.status(409).json({ message: 'This word already exists' });
    }

    const [result]: any = await pool.query(
      'INSERT INTO words (word, part_of_speech, motif, mnemonic, status) VALUES (?, ?, ?, ?, ?)',
      [lowerWord, part_of_speech || null, motif || null, mnemonic || null, 'queued']
    );
    
    const newWord = {
      id: result.insertId,
      word: lowerWord,
      part_of_speech,
      motif,
      mnemonic,
      status: 'queued'
    };
    
    res.status(201).json(newWord);
  } catch (error) {
    console.error('Error adding word:', error);
    res.status(500).json({ message: 'Error adding word' });
  }
});

// Update a word
router.put('/:id', async (req: Request, res: Response) => {
  const { word, part_of_speech, motif, mnemonic, status } = req.body;
  const id = req.params.id;

  if (!word) {
    return res.status(400).json({ message: 'Word is required' });
  }

  try {
    const [result]: any = await pool.query(
      'UPDATE words SET word = ?, part_of_speech = ?, motif = ?, mnemonic = ?, status = ? WHERE id = ?',
      [word, part_of_speech || null, motif || null, mnemonic || null, status || 'queued', id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Word not found' });
    }

    res.json({
      id,
      word,
      part_of_speech,
      motif,
      mnemonic,
      status: status || 'queued'
    });
  } catch (error) {
    console.error('Error updating word:', error);
    res.status(500).json({ message: 'Error updating word' });
  }
});

// Delete a word
router.delete('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    const [result]: any = await pool.query(
      'DELETE FROM words WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Word not found' });
    }

    res.json({ message: 'Word deleted successfully' });
  } catch (error) {
    console.error('Error deleting word:', error);
    res.status(500).json({ message: 'Error deleting word' });
  }
});

export default router; 