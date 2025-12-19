import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useScoket } from "../hooks/useSocket"
import { CapturedPieces } from "../components/CapturedPieces"
// TODO: Move together, there is code repetation here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const RESIGN = "resign";
import { Chess } from 'chess.js';
// Timer import kept if we reintroduce per-side timers later


export const Game = () => {
    const socket = useScoket();
    const [chess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [searching, setSearching] = useState(false);
    const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
    const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white");
    const [moves, setMoves] = useState<string[]>([]);
    const [showMoves, setShowMoves] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [winner, setWinner] = useState<string | null>(null);
    const [isCheck, setIsCheck] = useState(false); 
    const [baseSeconds, setBaseSeconds] = useState<number>(300);
    const [whiteSeconds, setWhiteSeconds] = useState<number>(300);
    const [blackSeconds, setBlackSeconds] = useState<number>(300);
    const [gameEndReason, setGameEndReason] = useState<"checkmate" | "resignation" | "timeout" | null>(null);
    const [whiteCaptured, setWhiteCaptured] = useState<string[]>([]);
    const [blackCaptured, setBlackCaptured] = useState<string[]>([]);

    useEffect(() => {
        if(!socket){
            return;
        }
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            switch(message.type) {
                case INIT_GAME:
                    // setChess(new Chess());
                    setBoard(chess.board());
                    setStarted(true);
                    setSearching(false);
                    setMoves([]);
                    setWhiteCaptured([]);
                    setBlackCaptured([]);
                    // Set the player color from the server
                    setPlayerColor(message.payload.color);
                    setCurrentTurn("white");
                    // Use time control from server if available
                    const serverTime = message.payload.timeControl || baseSeconds;
                    setWhiteSeconds(serverTime);
                    setBlackSeconds(serverTime);
                    console.log(`Game initialized - You are playing ${message.payload.color}`);
                    break; 
                case MOVE:
                    const move = message.payload.move;
                    // Capture detection before making the move
                    const capturedSquare = chess.get(move.to);
                    if (capturedSquare) {
                        if (capturedSquare.color === "w") {
                            setBlackCaptured(prev => [...prev, capturedSquare.type]);
                        } else {
                            setWhiteCaptured(prev => [...prev, capturedSquare.type]);
                        }
                    }
                    chess.move(move);
                    setBoard(chess.board());
                    // Add move to history
                    setMoves([...moves, `${move.from}-${move.to}`]);
                    // Toggle turn after opponent moves
                    setCurrentTurn(chess.turn() === "w" ? "white" : "black");
                    // Check if in check
                    setIsCheck(chess.isCheck());
                    // Check if game is over
                    if(chess.isCheckmate()){
                        setGameOver(true);
                        const winnerColor = chess.turn() === "w" ? "black" : "white";
                        setWinner(winnerColor);
                        setGameEndReason("checkmate");
                    }
                    console.log("Move made");
                    break;
                case GAME_OVER:
                    setGameOver(true);
                    setWinner(message.payload.winner);
                    setGameEndReason(message.payload.reason || "resignation");
                    console.log("Game over");
                    break;
            }
        }
    },[socket, chess, moves, baseSeconds]);

    // Timer tick effect based on current turn
    useEffect(() => {
        if (!started || gameOver) return;
        const interval = setInterval(() => {
            if (currentTurn === "white") {
                setWhiteSeconds((s) => Math.max(0, s - 1));
            } else {
                setBlackSeconds((s) => Math.max(0, s - 1));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [currentTurn, started, gameOver]);

    // Optional: end the game on time-out
    useEffect(() => {
        if (whiteSeconds === 0 && !gameOver) {
            setGameOver(true);
            setWinner("black");
            setGameEndReason("timeout");
        } else if (blackSeconds === 0 && !gameOver) {
            setGameOver(true);
            setWinner("white");
            setGameEndReason("timeout");
        }
    }, [whiteSeconds, blackSeconds, gameOver]);
    if(!socket) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-950">
            <div className="text-center">
                <div className="text-white text-2xl font-semibold">Connecting…</div>
                <div className="mt-2 text-white/70">Starting WebSocket and preparing the board</div>
                <div className="mt-6 mx-auto w-12 h-12 border-4 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
        </div>
    )
    return <div className="flex flex-col overflow-x-hidden">
        {/* HEADER */}
        <header className="w-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-white/10 shadow-2xl sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 sm:pb-4 flex items-center gap-3 sm:gap-4">
                <div className="text-6xl sm:text-7xl drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" style={{ filter: 'drop-shadow(0 2px 8px rgba(255,255,255,0.3))' }}>♔</div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                        Chess.com
                    </h1>
                    <p className="text-white/60 text-xs sm:text-sm">Online Multiplayer Chess</p>
                </div>
            </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="justify-center flex">
        <div className="pb-4 max-w-6xl w-full px-2 sm:px-4 flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* LEFT SECTION - Chessboard + Captured Pieces */}
            <div className="flex-1 flex flex-col items-center">
                {/* Chess Board */}
                <div className="w-full flex justify-center">
                    <div className="relative max-w-full overflow-x-auto">
                        <ChessBoard chess={chess} setBoard={setBoard} socket={socket} board={board} playerColor={playerColor} currentTurn={currentTurn} setCurrentTurn={setCurrentTurn} moves={moves} setMoves={setMoves} showMoves={showMoves} gameOver={gameOver}/>
                    </div>
                </div>
                
                {/* Captured Pieces - Same width as board */}
                <div className="w-full mt-4 sm:mt-6 max-w-full">
                    <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-3 sm:p-6">
                        <div className="text-white text-base sm:text-lg font-bold mb-3 sm:mb-4 text-center">Captured Pieces</div>
                        <CapturedPieces whiteCaptured={whiteCaptured} blackCaptured={blackCaptured} />
                    </div>
                </div>
            </div>

            {/* RIGHT SIDEBAR - Full height */}
            <div className="w-full lg:w-80 bg-slate-800/40 rounded-xl flex justify-center">
                <div className="pt-8 sm:pt-16 text-center w-full px-3 sm:px-4 pb-4">
                        {!started && !searching && <Button onClick={() => { 
                        socket.send(JSON.stringify({
                            type: INIT_GAME,
                            payload: { timeControl: baseSeconds }
                        }));
                        setSearching(true);
                    }}>
                    Play
                    </Button>}
                    {!started && !searching && (
                        <div className="mt-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                            <div className="text-white font-semibold mb-2">Choose Time Control</div>
                            <div className="grid grid-cols-4 gap-2">
                                {[60, 180, 300, 600].map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setBaseSeconds(s)}
                                        className={`py-2 rounded-lg text-sm font-semibold transition-all ${baseSeconds===s? 'bg-emerald-500 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
                                    >
                                        {Math.floor(s/60)}m
                                    </button>
                                ))}
                            </div>
                            <div className="mt-3 flex items-center gap-2">
                                <input
                                    type="range"
                                    min={30}
                                    max={900}
                                    step={30}
                                    value={baseSeconds}
                                    onChange={(e)=> setBaseSeconds(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="text-white/80 w-14 text-right font-mono">{Math.floor(baseSeconds/60)}:{String(baseSeconds%60).padStart(2,'0')}</div>
                            </div>
                        </div>
                    )}
                    {searching && (
                        <div className="mt-6 backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 text-left">
                            <div className="text-white font-semibold mb-2">Waiting for opponent...</div>
                            <div className="text-white/90 text-sm mb-2">Time Control:</div>
                            <div className="text-yellow-400 font-mono font-bold text-xl">{Math.floor(baseSeconds/60)}:{String(baseSeconds%60).padStart(2,'0')}</div>
                        </div>
                    )}
                    {started && playerColor && <div>
                        {gameOver ? (
                            <div>
                                <div className="text-red-500 text-3xl font-bold mb-4">Game Over!</div>
                                {gameEndReason === "timeout" && (
                                    <div className="backdrop-blur-sm bg-orange-500/20 border border-orange-500/50 rounded-xl px-4 py-3 mb-4">
                                        <div className="text-orange-300 font-bold">⏱️ TIME OUT</div>
                                        <div className="text-white/90 text-sm">
                                            {playerColor === winner ? "Opponent ran out of time!" : "Your time ran out!"}
                                        </div>
                                    </div>
                                )}
                                {gameEndReason === "checkmate" && (
                                    <div className="backdrop-blur-sm bg-purple-500/20 border border-purple-500/50 rounded-xl px-4 py-3 mb-4">
                                        <div className="text-purple-300 font-bold">♔ CHECKMATE</div>
                                    </div>
                                )}
                                {winner === playerColor ? (
                                    <div className="text-yellow-400 text-2xl font-bold">🎉 You Win! 🎉</div>
                                ) : (
                                    <div className="text-gray-400 text-2xl font-bold">You Lost</div>
                                )}
                                <div className="mt-4 text-white text-lg">Winner: <span className="font-bold uppercase">{winner}</span></div>
                            </div>
                        ) : (
                            <div>
                                <div className="text-green-400 text-2xl font-bold mb-4">Game Started!</div>
                                {playerColor === "white" && <div className="text-white text-lg">You are playing: <span className="font-bold text-yellow-300">WHITE</span></div>}
                                {playerColor === "black" && <div className="text-white text-lg">You have to run: <span className="font-bold text-gray-400">BLACK</span> pieces</div>}
                                {isCheck && currentTurn === playerColor && (
                                    <div className="mt-3 bg-red-600 text-white font-bold py-2 px-4 rounded animate-pulse">
                                        ⚠️ CHECK! Your King is under attack!
                                    </div>
                                )}
                                <div className="mt-4 text-lg">
                                    {currentTurn === playerColor ? (
                                        <div className="text-green-400 font-bold">Your Turn ✓</div>
                                    ) : (
                                        <div className="text-red-400 font-bold">Opponent's Turn</div>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="mt-6 w-full">
                            <div className="text-white text-lg font-bold mb-3">Move History</div>
                            <div className="backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl p-4 h-48 overflow-y-auto">
                                {moves.length === 0 ? (
                                    <div className="text-gray-400 text-sm text-center py-8">No moves yet...</div>
                                ) : (
                                    <div className="space-y-2">
                                        {Array.from({ length: Math.ceil(moves.length / 2) }).map((_, idx) => {
                                            const whiteMove = moves[idx * 2];
                                            const blackMove = moves[idx * 2 + 1];
                                            return (
                                                <div key={idx} className="flex items-center gap-3 text-sm">
                                                    <div className="font-bold text-white/60 w-6">{idx + 1}.</div>
                                                    <div className="flex gap-2">
                                                        {whiteMove && (
                                                            <div className="bg-yellow-600/30 border border-yellow-600/50 rounded px-2 py-1 text-white/80 font-mono text-xs">
                                                                {whiteMove}
                                                            </div>
                                                        )}
                                                        {blackMove && (
                                                            <div className="bg-gray-700/30 border border-gray-600/50 rounded px-2 py-1 text-white/80 font-mono text-xs">
                                                                {blackMove}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                        {!gameOver && (
                            <div className="mt-4 space-y-3">
                                <button
                                  onClick={() => setShowMoves(!showMoves)}
                                  className={`relative group w-full py-3 px-4 rounded-xl font-semibold text-white transition-all overflow-hidden
                                  ${showMoves ? 'from-emerald-600 via-green-600 to-emerald-700' : 'from-sky-600 via-blue-600 to-indigo-600'}
                                  bg-gradient-to-r shadow-[0_10px_30px_rgba(59,130,246,0.35)] hover:shadow-[0_20px_40px_rgba(59,130,246,0.55)]`}
                                >
                                  <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.2),transparent_40%)]" />
                                  <span className="relative z-10">{showMoves ? '✓ Show Moves: ON' : 'Show Moves: OFF'}</span>
                                </button>
                                <button onClick={() => {
                                    if(window.confirm("Are you sure you want to resign?")){
                                        socket.send(JSON.stringify({
                                            type: RESIGN
                                        }));
                                        setGameOver(true);
                                        setWinner(playerColor === "white" ? "black" : "white");
                                        setGameEndReason("resignation");
                                    }
                                }} className="relative group w-full py-3 px-4 rounded-xl font-semibold text-white transition-all overflow-hidden bg-gradient-to-r from-rose-600 via-red-600 to-orange-600 shadow-[0_10px_30px_rgba(244,63,94,0.4)] hover:shadow-[0_20px_40px_rgba(244,63,94,0.6)]">
                                    <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_var(--x,50%)_var(--y,50%),rgba(255,255,255,0.2),transparent_40%)]" />
                                    Resign
                                </button>
                            </div>
                        )}
                    </div>}
                    </div>
                </div>
        </div>
        </div>    
    </div>
}