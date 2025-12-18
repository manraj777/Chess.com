import { Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../screens/Game";

export const ChessBoard = ({ chess, board, socket, setBoard, playerColor, currentTurn, setCurrentTurn }: {
    chess: any;
    setBoard: any;
    board:({
        square: Square;
        type: PieceSymbol;
        color: Color;
    } | null)[][];
    socket : WebSocket;
    playerColor: "white" | "black" | null;
    currentTurn: "white" | "black";
    setCurrentTurn: (turn: "white" | "black") => void;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const [to, setTo] = useState<null | Square>(null);
    
    // Flip board for black player perspective
    const displayBoard = playerColor === "black" ? board.slice().reverse().map(row => row.slice().reverse()) : board;
    
    return <div className="text-white-200">
        {displayBoard.map((row, i) => {
            return <div key={i} className="flex">
                {row.map((square, j) => {
                    // Adjust square calculation based on player perspective
                    let squareRepresentation: Square;
                    if(playerColor === "black"){
                        squareRepresentation = String.fromCharCode(97 + (7 - j)) + "" + (i + 1) as Square;
                    } else {
                        squareRepresentation = String.fromCharCode(97 + j) + "" + (8 - i) as Square;
                    }
                    return <div onClick={()=>{
                        // Check if it's this player's turn
                        if(currentTurn !== playerColor){
                            console.log("Not your turn!");
                            return;
                        }
                        
                        if(!from){
                            // Check if the selected piece belongs to the current player
                            if(square && square.color === (playerColor === "white" ? "w" : "b")){
                                setFrom(squareRepresentation);
                            } else {
                                console.log("You can only move your own pieces!");
                            }
                        } else {
                            // Attempt to make the move
                            socket.send(JSON.stringify({
                                type: MOVE,
                                payload: {
                                    move: {
                                        from,
                                        to: squareRepresentation
                                    }                                   
                                }
                            }))

                            setFrom(null)
                            chess.move({
                                from,
                                to: squareRepresentation
                            });
                            setBoard(chess.board());
                            // Switch turn
                            setCurrentTurn(playerColor === "white" ? "black" : "white");
                            console.log( {
                                from,
                                to:squareRepresentation
                            })
                        }
                    }} key={j} className={`w-16 h-16 ${(i+j)%2 === 0 ? 'bg-green-500':'bg-slate-500'}`}>
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col">
                            {square ? <img className="w-4" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} /> : null} 
                            </div>
                        </div>   
                    </div>
                })}

            </div>
        })}
    </div>
}