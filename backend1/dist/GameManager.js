"use strict";
// interface Game {
//     id: number;
//     name: string;
//     players: WebSocket[];
// }
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameManager = void 0;
const messages_1 = require("./messages");
const Game_1 = require("./Game");
// user, game
class GameManager {
    constructor() {
        this.games = [];
        this.pendingUsers = new Map();
        this.users = [];
    }
    addUser(socket) {
        this.users.push(socket);
        this.addHandler(socket);
    }
    removerUser(socket) {
        this.users = this.users.filter((user) => user !== socket);
        //stop game here because user has left
    }
    addHandler(socket) {
        socket.on("message", (data) => {
            var _a;
            const message = JSON.parse(data.toString());
            if (message.type === messages_1.INIT_GAME) {
                const timeControl = ((_a = message.payload) === null || _a === void 0 ? void 0 : _a.timeControl) || 300; // default 5 min
                // Check if someone is waiting with the same time control
                if (this.pendingUsers.has(timeControl)) {
                    const opponent = this.pendingUsers.get(timeControl);
                    const game = new Game_1.Game(opponent, socket, timeControl);
                    this.games.push(game);
                    this.pendingUsers.delete(timeControl);
                }
                else {
                    // Add to queue for this time control
                    this.pendingUsers.set(timeControl, socket);
                }
            }
            if (message.type === messages_1.MOVE) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.makeMove(socket, message.payload.move);
                }
            }
            if (message.type === messages_1.RESIGN) {
                const game = this.games.find(game => game.player1 === socket || game.player2 === socket);
                if (game) {
                    game.handleResign(socket);
                }
            }
        });
    }
}
exports.GameManager = GameManager;
