import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useScoket } from "../hooks/useSocket"
// TODO: Move together, there is code repetation here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
export const RESIGN = "resign";
import { Chess } from 'chess.js';


export const Game = () => {
    const socket = useScoket();
    const [chess, setChess] = useState(new Chess());
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
                    // Set the player color from the server
                    setPlayerColor(message.payload.color);
                    setCurrentTurn("white");
                    console.log(`Game initialized - You are playing ${message.payload.color}`);
                    break; 
                case MOVE:
                    const move = message.payload;
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
                    }
                    console.log("Move made");
                    break;
                case GAME_OVER:
                    setGameOver(true);
                    setWinner(message.payload.winner);
                    console.log("Game over");
                    break;
            }
        }
    },[socket, chess, moves]);
    if(!socket) return <div>Conecting...</div>
    return <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    <ChessBoard chess={chess} setBoard= {setBoard} socket={socket} board ={board} playerColor={playerColor} currentTurn={currentTurn} setCurrentTurn={setCurrentTurn} moves={moves} setMoves={setMoves} showMoves={showMoves} gameOver={gameOver}/>
                </div>
                <div className="col-span-2 bg-slate-800 w-full flex justify-center">
                    <div className="pt-8 text-center">
                        {!started && !searching && <Button onClick={() => { 
                        socket.send(JSON.stringify({
                            type: INIT_GAME
                        }));
                        setSearching(true);
                    }}>
                    Play
                    </Button>}
                    {searching && <div>
                        <div className="text-white text-2xl font-bold mb-4">Searching for opponent...</div>
                        <div className="text-yellow-400 text-xl">You are playing as: <span className="font-bold">White</span></div>
                        <div className="mt-4 animate-pulse">⏳ Waiting for Player 2...</div>
                    </div>}
                    {started && playerColor && <div>
                        {gameOver ? (
                            <div>
                                <div className="text-red-500 text-3xl font-bold mb-4">Game Over!</div>
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
                        <div className="mt-6">
                            <div className="text-white text-lg font-bold mb-3">Move History</div>
                            <div className="bg-slate-700 rounded-lg p-3 max-h-48 overflow-y-auto">
                                {moves.length === 0 ? (
                                    <div className="text-gray-400 text-sm">No moves yet...</div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        {moves.map((move, index) => (
                                            <div key={index} className={`text-sm p-2 rounded ${index % 2 === 0 ? 'bg-slate-600 text-yellow-300' : 'bg-slate-500 text-gray-200'}`}>
                                                <span className="font-semibold">{Math.floor(index / 2) + 1}.</span> {move}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        {!gameOver && (
                            <div className="mt-4 space-y-2">
                                <button onClick={() => setShowMoves(!showMoves)} className={`w-full py-2 px-4 rounded font-bold text-white transition-all ${showMoves ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                    {showMoves ? '✓ Show Moves: ON' : 'Show Moves: OFF'}
                                </button>
                                <button onClick={() => {
                                    if(window.confirm("Are you sure you want to resign?")){
                                        socket.send(JSON.stringify({
                                            type: RESIGN
                                        }));
                                        setGameOver(true);
                                        setWinner(playerColor === "white" ? "black" : "white");
                                    }
                                }} className="w-full py-2 px-4 rounded font-bold text-white bg-red-600 hover:bg-red-700 transition-all">
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