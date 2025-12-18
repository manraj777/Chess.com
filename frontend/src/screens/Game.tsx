import { useEffect, useState } from "react";
import { Button } from "../components/Button"
import { ChessBoard } from "../components/ChessBoard"
import { useScoket } from "../hooks/useSocket"
// TODO: Move together, there is code repetation here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";
import { Chess } from 'chess.js';


export const Game = () => {
    const socket = useScoket();
    const [chess, setChess] = useState(new Chess());
    const [board, setBoard] = useState(chess.board());
    const [started, setStarted] = useState(false);
    const [searching, setSearching] = useState(false);
    const [playerColor, setPlayerColor] = useState<"white" | "black" | null>(null);
    const [currentTurn, setCurrentTurn] = useState<"white" | "black">("white"); 

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
                    // Set the player color from the server
                    setPlayerColor(message.payload.color);
                    setCurrentTurn("white");
                    console.log(`Game initialized - You are playing ${message.payload.color}`);
                    break; 
                case MOVE:
                    const move = message.payload;
                    chess.move(move);
                    setBoard(chess.board());
                    // Toggle turn after opponent moves
                    setCurrentTurn(chess.turn() === "w" ? "white" : "black");
                    console.log("Move made");
                    break;
                case GAME_OVER:
                    console.log("Game over");
                    break;
            }
        }
    },[socket, chess]);
    if(!socket) return <div>Conecting...</div>
    return <div className="justify-center flex">
        <div className="pt-8 max-w-screen-lg w-full">
            <div className="grid grid-cols-6 gap-4 w-full">
                <div className="col-span-4 w-full flex justify-center">
                    <ChessBoard chess={chess} setBoard= {setBoard} socket={socket} board ={board} playerColor={playerColor} currentTurn={currentTurn} setCurrentTurn={setCurrentTurn}/>
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
                        <div className="text-green-400 text-2xl font-bold mb-4">Game Started!</div>
                        {playerColor === "white" && <div className="text-white text-lg">You are playing: <span className="font-bold text-yellow-300">WHITE</span></div>}
                        {playerColor === "black" && <div className="text-white text-lg">You have to run: <span className="font-bold text-gray-400">BLACK</span> pieces</div>}
                        <div className="mt-4 text-lg">
                            {currentTurn === playerColor ? (
                                <div className="text-green-400 font-bold">Your Turn ✓</div>
                            ) : (
                                <div className="text-red-400 font-bold">Opponent's Turn</div>
                            )}
                        </div>
                    </div>}
                    </div>                                  
                </div>
            </div>
        </div>    
    </div>
}