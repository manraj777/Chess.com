"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const chess_js_1 = require("chess.js");
const messages_1 = require("./messages");
class Game {
    constructor(player1, player2) {
        this.player1 = player1;
        this.player2 = player2;
        this.board = new chess_js_1.Chess;
        this.startTime = new Date();
        this.player1.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "white"
            }
        }));
        this.player2.send(JSON.stringify({
            type: messages_1.INIT_GAME,
            payload: {
                color: "black"
            }
        }));
    }
    makeMove(socket, move) {
        // validate the type of move using zod
        // validation check, is it a user moves, is the move valide
        if (this.board.move.length % 2 === 0 && socket !== this.player1) {
            return;
        }
        if (this.board.move.length % 2 === 1 && socket !== this.player2) {
            return;
        }
        try {
            this.board.move(move);
        }
        catch (e) {
            console.log(e);
            return;
        }
        // update the board, push the move
        // check if the game is over, 
        if (this.board.isGameOver()) {
            this.player1.emit(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            this.player2.emit(JSON.stringify({
                type: messages_1.GAME_OVER,
                payload: {
                    winner: this.board.turn() === "w" ? "black" : "white"
                }
            }));
            return;
        }
        // send the update board to both player
        if (this.board.moves.length % 2 === 0) {
            this.player2.emit(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
        else {
            this.player2.emit(JSON.stringify({
                type: messages_1.MOVE,
                payload: move
            }));
        }
    }
}
exports.Game = Game;
