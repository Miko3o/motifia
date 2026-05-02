interface NoteProps {
  note: string;
  xOffset?: number;
}

const getNotePosition = (note: string): { position: number; isSharp: boolean } => {
  const basePositions: { [key: string]: number } = {
    C: 60,
    D: 55,
    E: 50,
    F: 45,
    G: 40,
    A: 35,
    B: 30,
  };

  let position: number;
  let isSharp = false;
  let octaveShift = 0;

  let noteKey = note;
  if (noteKey.includes("#")) {
    isSharp = true;
    noteKey = noteKey.replace("#", "");
  }

  const octaveUp = noteKey.match(/\*/g)?.length || 0;
  const octaveDown = noteKey.match(/"/g)?.length || 0;
  octaveShift = octaveDown * 35 - octaveUp * 35;
  noteKey = noteKey.replace(/[*|"]/g, "");

  position = basePositions[noteKey];
  if (position === undefined) {
    console.warn(`Invalid note: ${note}`);
    return { position: 60, isSharp: false };
  }

  return { position: position + octaveShift, isSharp };
};

const Note = ({ note, xOffset = 0 }: NoteProps) => {
  const { position, isSharp } = getNotePosition(note);

  return (
    <g transform={`translate(${xOffset}, 0)`}>
      {isSharp && (
        <image
          href="/images/sharp.svg"
          x="62"
          y={position - 20}
          width="40"
          height="40"
        />
      )}

      <ellipse
        cx="100"
        cy={position}
        rx="8"
        ry="6"
        transform={`rotate(-20, 100, ${position})`}
        fill="black"
      />
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
