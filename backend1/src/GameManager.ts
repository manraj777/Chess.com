// interface Game {
//     id: number;
//     name: string;
//     players: WebSocket[];
// }

import { WebSocket, WebSocketServer } from "ws";
import { INIT_GAME, MOVE, RESIGN } from "./messages";
import { Game } from "./Game";
// user, game
export class GameManager {
    private games: Game[];
    private pendingUsers: Map<number, WebSocket>; // timeControl -> socket
    private users: WebSocket[];

    constructor(){  
        this.games = [];
        this.pendingUsers = new Map();
        this.users = [];
    }

    addUser(socket: WebSocket){
         this.users.push(socket);
         this.addHandler(socket);
    }

    removerUser(socket: WebSocket){
        this.users = this.users.filter((user: WebSocket) => user !== socket);
        //stop game here because user has left
    }
    private addHandler(socket:WebSocket) {
        socket.on("message",(data) => {
            const message = JSON.parse(data.toString());

            if (message.type === INIT_GAME){
                const timeControl = message.payload?.timeControl || 300; // default 5 min
                
                // Check if someone is waiting with the same time control
                if (this.pendingUsers.has(timeControl)){
                    const opponent = this.pendingUsers.get(timeControl)!;
                    const game = new Game(opponent, socket, timeControl);
                    this.games.push(game);
                    this.pendingUsers.delete(timeControl);
                } else {
                    // Add to queue for this time control
                    this.pendingUsers.set(timeControl, socket);
                }
            }
            if ( message.type === MOVE){
                 const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game){
                    game.makeMove(socket, message.payload.move);
                }
            }
            if (message.type === RESIGN){
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game){
                    game.handleResign(socket);
                }
            }
        })
    }
}