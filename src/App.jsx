import { useState, useEffect } from 'react';
import { 
  RotateCw, 
  HelpCircle, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Trophy, 
  Activity, 
  Compass,
  ArrowRight
} from 'lucide-react';
import { sounds } from './audio';

const R = 95; // Radius of hexagons
const dx = Math.sqrt(3) * R; // ~164.54
const dy = 1.5 * R; // 142.5

const POSITIONS = [
  { id: 0, label: "Center", x: 0, y: 0, color: "from-stone-800 to-amber-950/40" },
  { id: 1, label: "Top-Right", x: dx / 2, y: -dy, color: "from-stone-800 to-emerald-950/30" },
  { id: 2, label: "Right", x: dx, y: 0, color: "from-stone-800 to-blue-950/30" },
  { id: 3, label: "Bottom-Right", x: dx / 2, y: dy, color: "from-stone-800 to-purple-950/30" },
  { id: 4, label: "Bottom-Left", x: -dx / 2, y: dy, color: "from-stone-800 to-teal-950/30" },
  { id: 5, label: "Left", x: -dx, y: 0, color: "from-stone-800 to-orange-950/30" },
  { id: 6, label: "Top-Left", x: -dx / 2, y: -dy, color: "from-stone-800 to-red-950/30" }
];

const DIALS = [
  {
    id: "left",
    name: "Left Dial",
    x: -dx / 2,
    y: -dy / 3,
    positions: [0, 5, 6] // Center, Left, Top-Left
  },
  {
    id: "top-right",
    name: "Top-Right Dial",
    x: dx / 2,
    y: -dy / 3,
    positions: [0, 1, 2] // Center, Top-Right, Right
  },
  {
    id: "bottom-right",
    name: "Bottom-Right Dial",
    x: 0,
    y: 2 * dy / 3,
    positions: [0, 3, 4] // Center, Bottom-Right, Bottom-Left
  }
];

// Symbols removed to focus purely on the coin segments alignment.

export default function App() {
  const [pieces, setPieces] = useState([
    { id: 0, currentPos: 0, visualRotation: 0 },
    { id: 1, currentPos: 1, visualRotation: 0 },
    { id: 2, currentPos: 2, visualRotation: 0 },
    { id: 3, currentPos: 3, visualRotation: 0 },
    { id: 4, currentPos: 4, visualRotation: 0 },
    { id: 5, currentPos: 5, visualRotation: 0 },
    { id: 6, currentPos: 6, visualRotation: 0 }
  ]);

  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [scrambling, setScrambling] = useState(false);

  // Initialize and scramble on startup
  useEffect(() => {
    // Small delay to let user load the page, then scramble
    const timer = setTimeout(() => {
      handleScramble(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Check win state
  useEffect(() => {
    const isWin = pieces.every(p => p.id === p.currentPos && (p.visualRotation % 360) === 0);
    if (isWin && moves > 0 && !won) {
      setWon(true);
      if (!muted) {
        sounds.playVictory();
      }
    }
  }, [pieces, moves, won, muted]);

  // Toggle Mute
  const toggleMute = () => {
    setMuted(!muted);
    // Init Audio Context on interaction
    sounds.init();
  };

  // Perform Scramble by executing sequential random dial rotations
  const handleScramble = (isInitial = false) => {
    if (scrambling) return;
    setWon(false);
    setScrambling(true);

    const dialIds = ["left", "top-right", "bottom-right"];
    const steps = 5 + Math.floor(Math.random() * 3); // 5 to 7 random dial rotations
    let currentStep = 0;

    const interval = setInterval(() => {
      const dialId = dialIds[Math.floor(Math.random() * 3)];
      
      if (!muted) {
        sounds.playClick();
      }

      setPieces(prevPieces => {
        const dial = DIALS.find(d => d.id === dialId);
        const pos = dial.positions;
        const p0 = prevPieces.find(p => p.currentPos === pos[0]);
        const p1 = prevPieces.find(p => p.currentPos === pos[1]);
        const p2 = prevPieces.find(p => p.currentPos === pos[2]);

        return prevPieces.map(p => {
          if (p.id === p0.id) return { ...p, currentPos: pos[1], visualRotation: p.visualRotation + 120 };
          if (p.id === p1.id) return { ...p, currentPos: pos[2], visualRotation: p.visualRotation + 120 };
          if (p.id === p2.id) return { ...p, currentPos: pos[0], visualRotation: p.visualRotation + 120 };
          return p;
        });
      });

      currentStep++;
      if (currentStep >= steps) {
        clearInterval(interval);
        setScrambling(false);
        setMoves(0); // Reset move count after scrambling completes
      }
    }, isInitial ? 60 : 250);
  };

  // Rotate a Dial Clockwise
  const handleRotateDial = (dialId) => {
    if (won || scrambling) return;
    if (!muted) {
      sounds.playClick();
    }

    const dial = DIALS.find(d => d.id === dialId);
    const pos = dial.positions; // e.g. [0, 5, 6]

    setPieces(prevPieces => {
      // Find the pieces currently at pos[0], pos[1], pos[2]
      const p0 = prevPieces.find(p => p.currentPos === pos[0]);
      const p1 = prevPieces.find(p => p.currentPos === pos[1]);
      const p2 = prevPieces.find(p => p.currentPos === pos[2]);

      return prevPieces.map(p => {
        if (p.id === p0.id) {
          return { ...p, currentPos: pos[1], visualRotation: p.visualRotation + 120 };
        }
        if (p.id === p1.id) {
          return { ...p, currentPos: pos[2], visualRotation: p.visualRotation + 120 };
        }
        if (p.id === p2.id) {
          return { ...p, currentPos: pos[0], visualRotation: p.visualRotation + 120 };
        }
        return p;
      });
    });

    setMoves(m => m + 1);
  };

  // Reset to solved state
  const handleReset = () => {
    if (!muted) {
      sounds.playReset();
    }
    setPieces([
      { id: 0, currentPos: 0, visualRotation: 0 },
      { id: 1, currentPos: 1, visualRotation: 0 },
      { id: 2, currentPos: 2, visualRotation: 0 },
      { id: 3, currentPos: 3, visualRotation: 0 },
      { id: 4, currentPos: 4, visualRotation: 0 },
      { id: 5, currentPos: 5, visualRotation: 0 },
      { id: 6, currentPos: 6, visualRotation: 0 }
    ]);
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="stone-texture min-height-screen w-full flex flex-col items-center justify-between p-4 md:p-8 select-none relative overflow-hidden">
      
      {/* Decorative corners */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t-2 border-l-2 border-gold-600/30 pointer-events-none m-4 md:m-8" />
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-gold-600/30 pointer-events-none m-4 md:m-8" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-gold-600/30 pointer-events-none m-4 md:m-8" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b-2 border-r-2 border-gold-600/30 pointer-events-none m-4 md:m-8" />

      {/* Header bar */}
      <header className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex flex-col">
          <h1 className="font-serif text-2xl md:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 bg-clip-text text-transparent drop-shadow-md">
            HEXAGON PEDESTAL
          </h1>
          <p className="text-xs md:text-sm font-serif tracking-widest text-stone-400/80 uppercase">
            Resident Evil 4 Inspired Remake
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleMute}
            className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-700/60 hover:border-gold-500/50 hover:bg-stone-850 text-stone-300 transition-all duration-200"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-5 h-5 text-red-400/80" /> : <Volume2 className="w-5 h-5 text-gold-400" />}
          </button>
          <button 
            onClick={() => setShowInfo(!showInfo)}
            className="p-2.5 rounded-lg bg-stone-900/80 border border-stone-700/60 hover:border-gold-500/50 hover:bg-stone-850 text-stone-300 transition-all duration-200"
            title="How to Play"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Info panel */}
      {showInfo && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-stone-900 border-2 border-gold-600/50 rounded-xl p-6 max-w-md w-full text-stone-200 relative gold-glow-box">
            <h3 className="font-serif text-xl font-bold text-gold-400 mb-4 border-b border-stone-800 pb-2">
              PUZZLE INSTRUCTIONS
            </h3>
            <ul className="space-y-3 text-sm text-stone-300">
              <li className="flex gap-2">
                <span className="text-gold-400 font-bold">1.</span>
                <span>The puzzle has 7 hexagonal pieces: 1 Center and 6 Outer.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 font-bold">2.</span>
                <span>Solve the puzzle by rotating the 3 Dials located at the intersection points.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 font-bold">3.</span>
                <span>Each Dial rotates its 3 adjacent pieces 120° Clockwise.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-gold-400 font-bold">4.</span>
                <span>Victory is achieved when all runic lines align perfectly with their original positions and visual rotations.</span>
              </li>
            </ul>
            <button 
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full py-2 bg-amber-700 hover:bg-amber-600 border border-gold-500/40 rounded-lg text-white font-medium transition-colors duration-200 uppercase font-serif tracking-wider"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Main Board Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center my-6 z-10">
        
        {/* Stone Pedestal Frame */}
        <div className="relative pedestal-ring w-[440px] h-[440px] rounded-full border-4 border-stone-800 bg-stone-950/80 flex items-center justify-center scale-[0.65] xs:scale-75 sm:scale-90 md:scale-100 lg:scale-110 transition-transform duration-300">
          
          {/* Inner Pedestal Details */}
          <div className="absolute inset-4 rounded-full border border-stone-800/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-stone-900 via-stone-950 to-stone-900 pointer-events-none" />
          
          {/* Subtle outer bronze ring guide */}
          <div className="absolute w-[360px] h-[360px] rounded-full border border-gold-900/10 pointer-events-none" />

          {/* Hexagons wrapper */}
          <div className="absolute select-none">
            {pieces.map(piece => {
              const posConfig = POSITIONS.find(p => p.id === piece.currentPos);
              const isCorrect = piece.id === piece.currentPos && (piece.visualRotation % 360) === 0;

              return (
                <div
                  key={piece.id}
                  style={{
                    position: "absolute",
                    transform: `translate(${posConfig.x - 90}px, ${posConfig.y - 90}px)`,
                    width: "180px",
                    height: "180px",
                  }}
                  className="transition-all duration-300 ease-out pointer-events-none"
                >
                  {/* Hexagon Shape Container */}
                  <div 
                    className={`w-full h-full hexagon-clip bg-gradient-to-br ${posConfig.color} border border-stone-700/20 p-[2px] transition-all duration-300 relative group`}
                  >
                    <div 
                      style={{
                        backgroundImage: 'url(/coin.jpg)',
                        backgroundSize: '320px 320px',
                        backgroundPosition: `${-POSITIONS[piece.id].x - 70}px ${-POSITIONS[piece.id].y - 70}px`,
                        backgroundRepeat: 'no-repeat',
                        transform: `rotate(${piece.visualRotation}deg)`,
                      }}
                      className={`w-full h-full hexagon-clip flex items-center justify-center transition-all duration-300 relative ${
                        isCorrect 
                          ? 'bg-amber-950/20 ring-1 ring-gold-500/20' 
                          : 'bg-stone-900 hover:bg-stone-850'
                      }`}
                    >
                      {/* Dark overlay to make the gold runes pop and look atmospheric */}
                      <div className="absolute inset-0 bg-stone-950/45 mix-blend-multiply pointer-events-none" />
                      
                      {/* Runic Pattern Overlay */}
                      <svg 
                        width="180" 
                        height="180" 
                        viewBox="-90 -90 180 180"
                        className={`w-full h-full relative z-10 ${
                          isCorrect ? 'animate-pulse-glow text-gold-400' : 'text-stone-300/90'
                        }`}
                      >
                        {/* Shimmer background on correct */}
                        {isCorrect && (
                          <polygon 
                            points="0,-95 82.27,-47.5 82.27,47.5 0,95 -82.27,47.5 -82.27,-47.5" 
                            fill="rgba(251,191,36,0.05)" 
                          />
                        )}
                        {/* Outer frame border */}
                        <polygon 
                          points="0,-95 82.27,-47.5 82.27,47.5 0,95 -82.27,47.5 -82.27,-47.5" 
                          fill="none" 
                          stroke={isCorrect ? "rgba(251, 191, 36, 0.5)" : "rgba(139, 92, 26, 0.3)"} 
                          strokeWidth="2.5" 
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Dial Interactive Controllers */}
            {DIALS.map(dial => (
              <button
                key={dial.id}
                onClick={() => handleRotateDial(dial.id)}
                disabled={won || scrambling}
                style={{
                  position: "absolute",
                  transform: `translate(${dial.x - 22}px, ${dial.y - 22}px)`,
                  width: "44px",
                  height: "44px",
                  zIndex: 20
                }}
                className={`rounded-full bg-stone-900 border-2 border-amber-600/70 hover:border-gold-400 text-gold-500/80 hover:text-gold-400 flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg shadow-black/80 hover:gold-glow-box ${
                  won ? 'opacity-30 cursor-not-allowed' : ''
                }`}
                title={`Rotate ${dial.name}`}
              >
                <RotateCw className="w-5 h-5 animate-none group-hover:rotate-180 transition-transform duration-500" />
              </button>
            ))}
          </div>

          {/* Victory Overlay */}
          {won && (
            <div className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center p-6 text-center animate-rune-appear z-35 backdrop-blur-sm">
              <Trophy className="w-14 h-14 text-gold-400 mb-2 filter drop-shadow(0 0 8px rgba(251, 191, 36, 0.6)) animate-bounce" />
              <h2 className="font-serif text-3xl font-black text-gold-400 tracking-wider gold-glow uppercase">
                Pedestal Solved
              </h2>
              <p className="text-sm text-stone-300 mt-2 font-serif uppercase tracking-widest max-w-[200px]">
                The stone lock opens with {moves} moves
              </p>
              <button
                onClick={handleScramble}
                className="mt-5 px-6 py-2 bg-gradient-to-r from-amber-800 to-amber-700 hover:from-amber-750 hover:to-amber-650 text-stone-100 rounded-lg text-sm font-semibold tracking-wider font-serif uppercase transition-all duration-200 shadow-md border border-gold-500/30"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer controls & Move indicators */}
      <footer className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
        <div className="flex gap-4 items-center bg-stone-950/70 border border-stone-850 px-4 py-2.5 rounded-xl">
          <div className="flex items-center gap-1.5 text-stone-400 text-sm">
            <Activity className="w-4 h-4 text-amber-500/80" />
            <span className="font-serif tracking-wider uppercase text-xs">Moves:</span>
            <span className="font-mono text-gold-400 font-bold text-base ml-1">{moves}</span>
          </div>
          <div className="w-[1px] h-4 bg-stone-800" />
          <div className="flex items-center gap-1.5 text-stone-400 text-sm">
            <Compass className="w-4 h-4 text-amber-500/80" />
            <span className="font-serif tracking-wider uppercase text-xs">Target:</span>
            <span className="font-sans text-stone-300 text-xs font-semibold ml-1">Align Patterns</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-stone-900/90 hover:bg-stone-850 text-stone-300 hover:text-stone-100 border border-stone-700/60 hover:border-stone-600 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset (Solve)</span>
          </button>
          <button
            onClick={() => handleScramble(false)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-700/90 to-amber-800/90 hover:from-amber-650 hover:to-amber-750 text-white border border-gold-600/30 hover:border-gold-500/40 rounded-xl text-sm font-bold tracking-wide transition-all duration-200 shadow-lg shadow-amber-900/10 active:scale-95"
          >
            <span>Scramble</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
