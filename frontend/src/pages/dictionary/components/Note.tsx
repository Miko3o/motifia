import sharp from '../../../assets/images/sharp.svg';

interface NoteProps {
  note: string;  // Musical notation (e.g., "C", "C#", "C'")
  xOffset?: number; // Horizontal offset for positioning multiple notes
}

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
  const octaveUp = note.match(/\*/g)?.length || 0;
  const octaveDown = note.match(/"/g)?.length || 0;
  octaveShift = (octaveDown * 35) - (octaveUp * 35); // 35 units = one octave
  note = note.replace(/[*|"]/g, '');

  // Get base position
  position = basePositions[note];
  if (position === undefined) {
    console.warn(`Invalid note: ${note}`);
    return { position: 60, isSharp: false }; // Default to middle C
  }

  return { position: position + octaveShift, isSharp };
};

const Note = ({ note, xOffset = 0 }: NoteProps) => {
  const { position, isSharp } = getNotePosition(note);

  return (
    <g transform={`translate(${xOffset}, 0)`}>
      {/* Sharp sign (if active) */}
      {isSharp && (
        <image
          href={sharp}
          x="62"
          y={position - 20}
          width="40"
          height="40"
        />
      )}

      {/* Note */}
      <ellipse
        cx="100"
        cy={position}
        rx="8"
        ry="6"
        transform={`rotate(-20, 100, ${position})`}
        fill="black"
      />
      {/* Note stem */}
      <line 
        x1={position <= 50 ? "93" : "107"} 
        y1={position - 2} 
        x2={position <= 50 ? "93" : "107"} 
        y2={position <= 50 ? position + 37 : position - 37} 
        stroke="black" 
        strokeWidth="2" 
      />
    </g>
  );
};

export default Note; 