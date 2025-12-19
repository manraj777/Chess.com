
const pieceToImage: Record<string, string> = {
  p: "p.png",
  n: "n.png",
  b: "b.png",
  r: "r.png",
  q: "q.png",
  k: "k.png",
  P: "P copy.png",
  N: "N copy.png",
  B: "B copy.png",
  R: "R copy.png",
  Q: "Q copy.png",
  K: "K copy.png",
};

const PieceSlot = ({ piece, isOccupied }: { piece: string; isOccupied: boolean }) => {
  return (
    <div className="w-6 h-6 flex items-center justify-center">
      {isOccupied ? (
        <img
          src={`/${pieceToImage[piece]}`}
          alt={piece}
          className="w-5 h-5 drop-shadow-md opacity-70"
        />
      ) : (
        <div className="w-1 h-1 rounded-full bg-white/10" />
      )}
    </div>
  );
};

export const CapturedPieces = ({
  whiteCaptured,
  blackCaptured,
}: {
  whiteCaptured: string[];
  blackCaptured: string[];
}) => {
  // White pieces layout (pawns on top, back row on bottom)
  const whiteLayout = [
    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],  // pawns
    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],  // back row
  ];

  // Black pieces layout (pawns on top, back row on bottom - reversed horizontally)
  const blackLayout = [
    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'].slice().reverse(),  // pawns
    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'].slice().reverse(),  // back row
  ];

  // Track which pieces have been captured
  // Note: chess.js returns piece types as lowercase ('p', 'n', 'b', etc.)
  const whiteCapturedCopy = [...whiteCaptured];
  const blackCapturedCopy = [...blackCaptured];

  const isWhitePieceCaptured = (piece: string) => {
    // whiteCaptured contains black pieces (lowercase) that white captured
    const pieceType = piece.toLowerCase();
    const idx = whiteCapturedCopy.indexOf(pieceType);
    if (idx !== -1) {
      whiteCapturedCopy.splice(idx, 1);
      return true;
    }
    return false;
  };

  const isBlackPieceCaptured = (piece: string) => {
    // blackCaptured contains white pieces (lowercase) that black captured
    const pieceType = piece.toLowerCase();
    const idx = blackCapturedCopy.indexOf(pieceType);
    if (idx !== -1) {
      blackCapturedCopy.splice(idx, 1);
      return true;
    }
    return false;
  };

  return (
    <div className="w-full">
      <div className="flex items-start justify-center gap-12 px-4">
        {/* White's Captures (Black pieces that White captured) */}
        <div>
          <div className="text-white/60 text-xs font-semibold mb-2 text-center">White's Captures</div>
          <div className="space-y-1">
            {blackLayout.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1">
                {row.map((piece, colIdx) => (
                  <PieceSlot 
                    key={`${rowIdx}-${colIdx}`} 
                    piece={piece} 
                    isOccupied={isWhitePieceCaptured(piece)} 
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="h-16 w-px bg-gradient-to-b from-transparent via-white/30 to-transparent" />

        {/* Black's Captures (White pieces that Black captured) */}
        <div>
          <div className="text-white/60 text-xs font-semibold mb-2 text-center">Black's Captures</div>
          <div className="space-y-1">
            {whiteLayout.map((row, rowIdx) => (
              <div key={rowIdx} className="flex gap-1">
                {row.map((piece, colIdx) => (
                  <PieceSlot 
                    key={`${rowIdx}-${colIdx}`} 
                    piece={piece} 
                    isOccupied={isBlackPieceCaptured(piece)} 
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
