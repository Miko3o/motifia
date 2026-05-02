import Note from "./Note";

interface NotationProps {
  notes?: string;
}

const parseNotes = (notesString: string): string[] => {
  const result: string[] = [];
  let currentNote = "";
  const chars = Array.from(notesString);

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (char.match(/[A-G]/)) {
      if (currentNote) {
        result.push(currentNote);
      }
      currentNote = char;
    } else if (char === "#" || char === "*" || char === '"') {
      currentNote += char;
    }
  }

  if (currentNote) {
    result.push(currentNote);
  }

  return result;
};

export default function Notation({ notes = "C" }: NotationProps) {
  const noteArray = parseNotes(notes);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Notation</h2>
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
        <svg
          width={Math.max(300, 100 + noteArray.length * 50 + 50)}
          height="100"
          viewBox={`0 0 ${Math.max(300, 100 + noteArray.length * 50 + 50)} 100`}
        >
          {[30, 40, 50, 60, 70].map((y) => (
            <line
              key={y}
              x1="10"
              y1={y}
              x2={Math.max(290, 90 + noteArray.length * 50 + 50)}
              y2={y}
              stroke="black"
              strokeWidth="1"
            />
          ))}

          <image
            href="/images/treble.svg"
            x="-25"
            y="-17"
            width="120"
            height="120"
            transform="rotate(-10, 40, 50)"
          />

          {noteArray.map((note, index) => (
            <Note key={index} note={note} xOffset={index * 50} />
          ))}
        </svg>
      </div>
    </div>
  );
}
