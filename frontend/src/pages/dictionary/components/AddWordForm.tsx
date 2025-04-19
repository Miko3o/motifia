import React, { useState, useEffect } from 'react';

interface AddWordFormProps {
  onSubmit: (word: {
    word: string;
    part_of_speech: string;
    motif: string;
    mnemonic: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const AddWordForm = ({ onSubmit, onCancel }: AddWordFormProps) => {
  const [newWord, setNewWord] = useState({
    word: '',
    part_of_speech: '',
    motif: '',
    mnemonic: ''
  });

  const [errors, setErrors] = useState({
    word: false,
    part_of_speech: false,
    motif: false,
    duplicate: false,
    motifPartOfSpeech: false
  });

  const [isChecking, setIsChecking] = useState(false);
  const [invalidMotifChars, setInvalidMotifChars] = useState(false);
  const [duplicateMotifWord, setDuplicateMotifWord] = useState<string | null>(null);
  const [isCheckingMotif, setIsCheckingMotif] = useState(false);
  const [motifPartOfSpeechError, setMotifPartOfSpeechError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkWordExists = async () => {
      const word = newWord.word.trim();
      console.log('Checking word:', word);
      
      if (!word) {
        console.log('Empty word, resetting states');
        setErrors(prev => ({ ...prev, duplicate: false }));
        setIsChecking(false);
        return;
      }

      setIsChecking(true);
      try {
        console.log('Fetching words from database...');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/words`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        console.log('Retrieved words:', words);
        
        const exists = words.some((w: { word: string }) => {
          const match = w.word.toLowerCase() === word.toLowerCase();
          if (match) {
            console.log('Found matching word:', w.word);
          }
          return match;
        });
        
        console.log('Word exists?', exists);
        setErrors(prev => ({ ...prev, duplicate: exists }));
      } catch (error) {
        console.error('Error checking word:', error);
      } finally {
        setIsChecking(false);
      }
    };

    console.log('Word changed, setting up check timeout');
    const timeoutId = setTimeout(() => {
      checkWordExists();
    }, 500);

    return () => {
      console.log('Cleaning up previous timeout');
      clearTimeout(timeoutId);
    };
  }, [newWord.word]);

  const getMotifPartOfSpeechError = (motif: string, partOfSpeech: string): string | null => {
    if (!motif.trim()) return null;
    
    const firstNote = motif.trim().charAt(0).toUpperCase();
    
    switch (partOfSpeech) {
      case 'noun':
        return firstNote !== 'C' ? 'Nouns must start with C' : null;
      case 'verb':
        return firstNote !== 'D' ? 'Verbs must start with D' : null;
      case 'adjective':
        return firstNote !== 'A' ? 'Adjectives must start with A' : null;
      case 'adverb':
        return firstNote !== 'A' ? 'Adverbs must start with A' : null;
      case 'pronoun':
        return firstNote !== 'C' ? 'Pronouns must start with C' : null;
      case 'preposition':
        return firstNote !== 'E' ? 'Prepositions must start with E' : null;
      case 'conjunction':
        return firstNote !== 'G' ? 'Conjunctions must start with G' : null;
      default:
        return null;
    }
  };

  useEffect(() => {
    const checkMotifExists = async () => {
      const motif = newWord.motif.trim();
      
      if (!motif || invalidMotifChars) {
        setDuplicateMotifWord(null);
        setIsCheckingMotif(false);
        return;
      }

      // Check part of speech rules
      const partOfSpeechError = getMotifPartOfSpeechError(motif, newWord.part_of_speech);
      setMotifPartOfSpeechError(partOfSpeechError);
      setErrors(prev => ({ ...prev, motifPartOfSpeech: !!partOfSpeechError }));

      setIsCheckingMotif(true);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/words`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const words = await response.json();
        
        const existingWord = words.find((w: { motif: string }) => 
          w.motif && w.motif.toLowerCase() === motif.toLowerCase()
        );
        
        setDuplicateMotifWord(existingWord ? existingWord.word : null);
      } catch (error) {
        console.error('Error checking motif:', error);
      } finally {
        setIsCheckingMotif(false);
      }
    };

    const timeoutId = setTimeout(() => {
      checkMotifExists();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newWord.motif, newWord.part_of_speech, invalidMotifChars]);

  const validateMotif = (value: string) => {
    // Only allow A-G, #, *, ", and spaces
    const validPattern = /^[A-G#*" ]*$/;
    return validPattern.test(value);
  };

  const handleMotifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewWord({ ...newWord, motif: value });
    setErrors({ ...errors, motif: false, motifPartOfSpeech: false });
    setInvalidMotifChars(!validateMotif(value));
    setMotifPartOfSpeechError(null);
  };

  const handlePartOfSpeechChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNewWord({ ...newWord, part_of_speech: value });
    setErrors({ ...errors, part_of_speech: false, motifPartOfSpeech: false });
    setMotifPartOfSpeechError(null);
  };

  const handleWordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Input event triggered');
    const value = e.target.value.toLowerCase();
    console.log('Input value:', value);
    setNewWord({ ...newWord, word: value });
    setErrors({ ...errors, word: false });
  };

  // Add console log for initial render
  useEffect(() => {
    console.log('Form component mounted');
  }, []);

  const handleSubmit = async () => {
    const newErrors = {
      word: !newWord.word.trim(),
      part_of_speech: !newWord.part_of_speech,
      motif: !newWord.motif.trim() || invalidMotifChars,
      duplicate: errors.duplicate,
      motifPartOfSpeech: errors.motifPartOfSpeech
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(newWord);
      
      // Reset form
      setNewWord({
        word: '',
        part_of_speech: '',
        motif: '',
        mnemonic: ''
      });
      setErrors({
        word: false,
        part_of_speech: false,
        motif: false,
        duplicate: false,
        motifPartOfSpeech: false
      });
      setInvalidMotifChars(false);
      setDuplicateMotifWord(null);
      
      // Close the form
      onCancel();
    } catch (error: any) {
      setIsSubmitting(false);
      if (error.message === 'This word already exists') {
        setErrors({ ...newErrors, duplicate: true });
      }
    }
  };

  return (
    <div className="mb-6 bg-white p-4 rounded-md shadow-md relative">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Word <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={newWord.word}
              onChange={(e) => {
                console.log('Direct onChange event');
                handleWordChange(e);
              }}
              className={`border rounded-md px-3 py-2 w-full ${errors.word || errors.duplicate ? 'border-red-500' : ''}`}
              placeholder="Enter word"
              required
            />
            {isChecking && (
              <span className="absolute right-3 top-2.5 text-gray-400">
                Checking...
              </span>
            )}
          </div>
          {errors.word && (
            <p className="text-red-500 text-sm mt-1">Word is required</p>
          )}
          {errors.duplicate && (
            <p className="text-red-500 text-sm mt-1">This word already exists in the database</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Part of Speech <span className="text-red-500">*</span>
          </label>
          <select
            value={newWord.part_of_speech}
            onChange={handlePartOfSpeechChange}
            className={`border rounded-md px-3 py-2 w-full ${errors.part_of_speech ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select part of speech</option>
            <option value="noun">Noun</option>
            <option value="verb">Verb</option>
            <option value="adjective">Adjective</option>
            <option value="adverb">Adverb</option>
            <option value="pronoun">Pronoun</option>
            <option value="preposition">Preposition</option>
            <option value="conjunction">Conjunction</option>
          </select>
          {errors.part_of_speech && (
            <p className="text-red-500 text-sm mt-1">Part of speech is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Musical Motif <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-col space-y-2">
            <div className="relative">
              <input
                type="text"
                value={newWord.motif}
                onChange={handleMotifChange}
                className={`border rounded-md px-3 py-2 w-full ${(errors.motif || errors.motifPartOfSpeech || invalidMotifChars) ? 'border-red-500' : ''}`}
                placeholder="Enter musical notation (e.g., CDEF*G)"
                required
              />
              {isCheckingMotif && (
                <span className="absolute right-3 top-2.5 text-gray-400">
                  Checking...
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Use letters A-G for notes, # for sharp, * for octave up, " for octave down
            </p>
            {errors.motif && !invalidMotifChars && (
              <p className="text-red-500 text-sm">Musical motif is required</p>
            )}
            {invalidMotifChars && (
              <p className="text-red-500 text-sm">Only use letters A-G, #, *, and " for notation</p>
            )}
            {motifPartOfSpeechError && (
              <p className="text-red-500 text-sm">{motifPartOfSpeechError}</p>
            )}
            {duplicateMotifWord && (
              <p className="text-red-500 text-sm">This motif is already assigned to "{duplicateMotifWord}"</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mnemonic
          </label>
          <textarea
            value={newWord.mnemonic}
            onChange={(e) => setNewWord({ ...newWord, mnemonic: e.target.value })}
            className="border rounded-md px-3 py-2 w-full"
            rows={2}
            placeholder="Enter a memory aid or description"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Request'}
          </button>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className={`bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddWordForm; 