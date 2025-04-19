import trebleClef from '../../../assets/images/treble.svg';
import Note from './Note';

// Note position mapping (middle C = 60)
const getNotePosition = (note: string): { position: number; isSharp: boolean } => {
  const basePositions: { [key: string]: number } = {
    'C': 60, // Middle C
    'D': 55,
    'E': 50,
    'F': 45,
    'G': 40,
    'A': 35,
    'B': 30,
  };

  let position: number;
  let isSharp = false;
  let octaveShift = 0;

  // Check for sharp
  if (note.includes('#')) {
    isSharp = true;
    note = note.replace('#', '');
  }

  // Check for octave markers
  const octaveUp = note.match(/'/g)?.length || 0;
  const octaveDown = note.match(/"/g)?.length || 0;
  octaveShift = (octaveDown * 35) - (octaveUp * 35); // 35 units = one octave
  note = note.replace(/['|"]/g, '');

  // Get base position
  position = basePositions[note];
  if (position === undefined) {
    console.warn(`Invalid note: ${note}`);
    return { position: 60, isSharp: false }; // Default to middle C
  }

  return { position: position + octaveShift, isSharp };
};

interface NotationProps {
  word: string;
  notes?: string; // Musical notation string (e.g., "C#DEF*G")
}

const parseNotes = (notesString: string): string[] => {
  const result: string[] = [];
  let currentNote = '';
  
  // Convert the string to an array of characters
  const chars = Array.from(notesString);
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    
    if (char.match(/[A-G]/)) {
      // If we have a previous note, save it
      if (currentNote) {
        result.push(currentNote);
      }
      // Start a new note
      currentNote = char;
    } else if (char === '#' || char === '*' || char === '"') {
      // Append modifiers to current note
      currentNote += char;
    }
    // Ignore any other characters
  }
  
  // Don't forget the last note
  if (currentNote) {
    result.push(currentNote);
  }
  
  return result;
};

const Notation = ({ 
  word,
  notes = "C" // Default to middle C
}: NotationProps) => {
  const noteArray = parseNotes(notes);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Notation</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <svg width={Math.max(300, 100 + (noteArray.length * 50) + 50)} height="100" 
             viewBox={`0 0 ${Math.max(300, 100 + (noteArray.length * 50) + 50)} 100`}>
          {/* Staff lines */}
          {[30, 40, 50, 60, 70].map(y => (
            <line 
              key={y}
              x1="10" 
              y1={y} 
              x2={Math.max(290, 90 + (noteArray.length * 50) + 50)} 
              y2={y} 
              stroke="black" 
              strokeWidth="1" 
            />
          ))}

          {/* Treble Clef */}
          <image
            href={trebleClef}
            x="-25"
            y="-17"
            width="120"
            height="120"
            transform="rotate(-10, 40, 50)"
          />

          {/* Notes */}
          {noteArray.map((note, index) => (
            <Note 
              key={index} 
              note={note}
              xOffset={index * 50}
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default Notation; 