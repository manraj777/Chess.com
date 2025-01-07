import { WebSocket } from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, MOVE } from "./messages";

export class Game {

    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess 
     private startTime: Date;

    constructor(player1: WebSocket, player2: WebSocket) {
        this.player1 = player1;
        this.player2 = player2; 
        this.board = new Chess; 
        this.startTime = new Date();
    }
    makeMove(socket: WebSocket, move:{
        from: string;
        to: string;
    }){
        // validate the type of move using zod
        // validation check, is it a user moves, is the move valide
        if ( this.board.move.length % 2 === 0 && socket !== this.player1){
            return;
        }  
        if ( this.board.move.length % 2 === 1 && socket !== this.player2){
            return;
        }
        try{
            this.board.move(move);
        }catch(e) {
            return;
        }
        
        // update the board, push the move
        // check if the game is over, 
        if (this.board.isGameOver()){
            this.player1.emit(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            return
        }
       
        // send the update board to both player
        if (this.board.moves.length % 2 === 0){
            this.player2.emit(JSON.stringify({
                type: MOVE,
                payload: move
            }))
        }else {
            this.player2.emit(JSON.stringify({
                type: MOVE,
                payload: move
            }))

        }

    }
}