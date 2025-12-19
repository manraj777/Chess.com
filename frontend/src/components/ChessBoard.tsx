import { Color, PieceSymbol, Square } from "chess.js";
import { useState, Dispatch, SetStateAction } from "react";
import { MOVE } from "../screens/Game";
// CapturedPieces import removed; board no longer renders it directly

export const ChessBoard = ({ chess, board, socket, setBoard, playerColor, currentTurn, setCurrentTurn, moves, setMoves, showMoves, gameOver, setWhiteCaptured, setBlackCaptured }: {
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
    moves: string[];
    setMoves: (moves: string[]) => void;
    showMoves: boolean;
    gameOver?: boolean;
    setWhiteCaptured?: Dispatch<SetStateAction<PieceSymbol[]>>;
    setBlackCaptured?: Dispatch<SetStateAction<PieceSymbol[]>>;
}) => {
    const [from, setFrom] = useState<null | Square>(null);
    const [legalMoves, setLegalMoves] = useState<Square[]>([]);
    
    // Flip board for black player perspective
    const displayBoard = playerColor === "black" ? board.slice().reverse().map(row => row.slice().reverse()) : board;
    
    return <div className="text-white-200 p-2 rounded-xl bg-gradient-to-br from-emerald-900/60 to-slate-900/60 shadow-2xl border border-white/10">
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
                        // Don't allow moves if game is over
                        if(gameOver){
                            return;
                        }
                        // Check if it's this player's turn
                        if(currentTurn !== playerColor){
                            console.log("Not your turn!");
                            return;
                        }
                        
                        if(!from){
                            // Check if the selected piece belongs to the current player
                            if(square && square.color === (playerColor === "white" ? "w" : "b")){
                                setFrom(squareRepresentation);
                                // Get legal moves for this piece if showMoves is enabled
                                if(showMoves){
                                    const pieceMoves = chess.moves({square: squareRepresentation, verbose: true});
                                    const destinationSquares = pieceMoves.map((move: any) => move.to as Square);
                                    setLegalMoves(destinationSquares);
                                }
                            } else {
                                console.log("You can only move your own pieces!");
                            }
                        } else {
                            // Detect capture before move
                            const captureSquare = chess.get(squareRepresentation);
                            if (captureSquare && setWhiteCaptured && setBlackCaptured) {
                                const capturedType = captureSquare.type as PieceSymbol;
                                // If black piece captured, add to whiteCaptured (white took black)
                                if (captureSquare.color === "b") {
                                    setWhiteCaptured((prev: PieceSymbol[] = []) => [...prev, capturedType]);
                                } else {
                                    // If white piece captured, add to blackCaptured (black took white)
                                    setBlackCaptured((prev: PieceSymbol[] = []) => [...prev, capturedType]);
                                }
                            }
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
                            setLegalMoves([]); // Clear legal moves after moving
                            // Add move to history
                            setMoves([...moves, `${from}-${squareRepresentation}`]);
                            // Switch turn
                            setCurrentTurn(playerColor === "white" ? "black" : "white");
                            console.log( {
                                from,
                                to:squareRepresentation
                            })
                        }
                    }} key={j} className={`w-16 h-16 ${from === squareRepresentation ? 'bg-yellow-400/80' : legalMoves.includes(squareRepresentation) ? 'bg-blue-500/70' : (i+j)%2 === 0 ? 'bg-emerald-700':'bg-emerald-900'} cursor-pointer transition-all duration-150 border border-black/30 shadow-inner`}>
                        <div className="w-full justify-center flex h-full">
                            <div className="h-full justify-center flex flex-col">
                            {square ? <img className="w-8 drop-shadow-xl" src={`/${square?.color === "b" ? square?.type : `${square?.type?.toUpperCase()} copy`}.png`} /> : null} 
                            </div>
                        </div>   
                    </div>
                })}

            </div>
        })}
    </div>
}