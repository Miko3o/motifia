import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AddWordForm from './components/AddWordForm';
import { wordsApi } from '../../utils/api';

interface Word {
  id: number;
  word: string;
  definition: string | null;
  example: string | null;
  part_of_speech: string | null;
  motif: string | null;
  status: 'queued' | 'accepted';
}

const Dictionary = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartOfSpeech, setSelectedPartOfSpeech] = useState<string>('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const navigate = useNavigate();

  // Get unique parts of speech for filter dropdown
  const partsOfSpeech = Array.from(new Set(words.map(word => word.part_of_speech || '').filter(Boolean)));

  // Filter words based on search term, part of speech, and status
  const filteredWords = words.filter(word => {
    const matchesSearch = word.word.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPartOfSpeech = !selectedPartOfSpeech || word.part_of_speech === selectedPartOfSpeech;
    const isAccepted = word.status === 'accepted';
    return matchesSearch && matchesPartOfSpeech && isAccepted;
  });

  useEffect(() => {
    fetchWords();
  }, []);

  const fetchWords = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await wordsApi.getAll();
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const data = await response.json();
      setWords(data);
    } catch (error) {
      console.error('Error fetching words:', error);
      setError('Failed to load words');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWord = async (newWord: {
    word: string;
    part_of_speech: string;
    motif: string;
    mnemonic: string;
  }) => {
    try {
      const response = await wordsApi.create(newWord);
      if (!response.ok) {
        throw new Error('Failed to add word');
      }
      
      // Show success message
      setShowSuccessMessage(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
        setIsAddingWord(false);
      }, 3000);
      
      fetchWords(); // Refresh the list
    } catch (error) {
      console.error('Error adding word:', error);
      setError('Failed to add word');
    }
  };

  const handleWordClick = (word: Word) => {
    // Encode the word for URL safety
    const encodedWord = encodeURIComponent(word.word.toLowerCase());
    navigate(`/dictionary/word/${encodedWord}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      {showSuccessMessage && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md border border-green-200">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium">Your word will be under review</span>
          </div>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-4xl font-bold">Dictionary</h1>
        <button
          onClick={() => setIsAddingWord(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
        >
          Request a Word
        </button>
      </div>

      {isAddingWord && (
        <AddWordForm
          onSubmit={handleAddWord}
          onCancel={() => setIsAddingWord(false)}
        />
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search words..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              value={selectedPartOfSpeech}
              onChange={(e) => setSelectedPartOfSpeech(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Parts of Speech</option>
              {partsOfSpeech.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </select>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Words</h2>
        {filteredWords.length === 0 ? (
          <p className="text-center text-gray-500">No words found.</p>
        ) : (
          <ul className="space-y-2">
            {filteredWords.map((word) => (
              <li
                key={word.id}
                onClick={() => handleWordClick(word)}
                className="p-4 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors cursor-pointer"
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium">{word.word}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 italic">
                      {word.part_of_speech}
                    </span>
                    {word.motif && (
                      <span className="text-sm text-blue-500">
                        ♪ {word.motif}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Dictionary; 