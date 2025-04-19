import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { wordsApi } from '../../../utils/api';

interface Word {
  id: number;
  word: string;
  part_of_speech: string | null;
  motif: string | null;
  mnemonic: string | null;
  status: 'queued' | 'accepted';
}

const QueueList = () => {
  const [queuedWords, setQueuedWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueuedWords();
  }, []);

  const fetchQueuedWords = async () => {
    try {
      const response = await wordsApi.getAll();
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      const words = await response.json();
      setQueuedWords(words.filter((word: Word) => word.status === 'queued'));
    } catch (error) {
      console.error('Error fetching queued words:', error);
      setError('Failed to load queued words');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (wordId: number) => {
    try {
      // First get the current word data
      const getResponse = await wordsApi.getById(wordId);
      if (!getResponse.ok) {
        throw new Error('Failed to fetch word data');
      }
      const wordData = await getResponse.json();

      // Then update with all required fields
      const response = await wordsApi.update(wordId, {
        word: wordData.word,
        part_of_speech: wordData.part_of_speech,
        motif: wordData.motif,
        mnemonic: wordData.mnemonic,
        status: 'accepted'
      });

      if (!response.ok) {
        throw new Error('Failed to accept word');
      }

      // Refresh the list after accepting
      fetchQueuedWords();
    } catch (error) {
      console.error('Error accepting word:', error);
      setError('Failed to accept word');
    }
  };

  const handleReject = async (wordId: number) => {
    try {
      const response = await wordsApi.delete(wordId);

      if (!response.ok) {
        throw new Error('Failed to reject word');
      }

      // Refresh the list after rejecting
      fetchQueuedWords();
    } catch (error) {
      console.error('Error rejecting word:', error);
      setError('Failed to reject word');
    }
  };

  const handleWordClick = (word: string) => {
    const encodedWord = encodeURIComponent(word.toLowerCase());
    navigate(`/dictionary/word/${encodedWord}`);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 py-4">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Word Queue</h3>
        {queuedWords.length === 0 ? (
          <p className="text-gray-500 text-center">No words in queue</p>
        ) : (
          <div className="space-y-4">
            {queuedWords.map((word) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <div 
                  className="flex-1 cursor-pointer p-2 rounded transition-colors"
                  onClick={() => handleWordClick(word.word)}
                >
                  <h4 className="font-medium">{word.word}</h4>
                  <div className="text-sm text-gray-500">
                    {word.part_of_speech && (
                      <span className="italic mr-2">{word.part_of_speech}</span>
                    )}
                    {word.motif && (
                      <span className="text-blue-500">♪ {word.motif}</span>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(word.id)}
                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleReject(word.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueueList; 