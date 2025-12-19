import { WebSocket } from "ws";
import { Chess } from 'chess.js'
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

export class Game {

    public player1: WebSocket;
    public player2: WebSocket;
    public board: Chess;
    private startTime: Date;
    private moveCount= 0;
    private timeControl: number;

    constructor(player1: WebSocket, player2: WebSocket, timeControl: number = 300) {
        this.player1 = player1;
        this.player2 = player2; 
        this.board = new Chess; 
        this.startTime = new Date();
        this.timeControl = timeControl;
        this.player1.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color:"white",
                timeControl: this.timeControl
            }
        }));
        this.player2.send(JSON.stringify({
            type: INIT_GAME,
            payload: {
                color:"black",
                timeControl: this.timeControl
            }
        }));
    }
    makeMove(socket: WebSocket, move:{
        from: string;
        to: string;
    }){
        // validate the type of move using zod
        // validation check, is it a user moves, is the move valide
        if ( this.moveCount % 2 === 0 && socket !== this.player1){
            return;
        }  
        if ( this.moveCount % 2 === 1 && socket !== this.player2){
            return;
        }
        try{
            this.board.move(move);
        }catch(e) {
            console.log(e);
            return;
        }
        // await db.moves.push(move);

        // update the board, push the move
        // check if the game is over, 
        if (this.board.isGameOver()){
            this.player1.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            this.player2.send(JSON.stringify({
                type: GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }))
            return;
        }
       
        // send the update board to both player
        if (this.moveCount % 2 === 0){
            this.player2.send(JSON.stringify({
                type: MOVE,
                payload: { move }
            }))
        }else {
            this.player1.send(JSON.stringify({
                type: MOVE,
                payload: { move }
            }))

        }
        this.moveCount++;
    }

    handleResign(socket: WebSocket){
        // Determine the winner based on who resigned
        const winner = socket === this.player1 ? "black" : "white";
        
        // Send game over message to both players
        this.player1.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                winner: winner
            }
        }));
        this.player2.send(JSON.stringify({
            type: GAME_OVER,
            payload: {
                winner: winner
            }
        }));
    }
}