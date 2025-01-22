// interface Game {
//     id: number;
//     name: string;
//     players: WebSocket[];
// }

import { WebSocket, WebSocketServer } from "ws";
import { INIT_GAME, MOVE } from "./messages";
import { Game } from "./Game";
// user, game
export class GameManager {
    private games: Game[];
    private pendingUser: WebSocket | null;
    private users: WebSocket[];

    constructor(){  
        this.games = [];
        this.pendingUser = null;
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
                if (this.pendingUser){
                    const game = new Game(this.pendingUser, socket);
                    this.games.push(game);
                    this.pendingUser = null;
                }else{
                    this.pendingUser = socket;
                }
            }
            if ( message.type === MOVE){
                 const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game){
                    game.makeMove(socket, message.payload.move);
                }
            }
        })
    }
}