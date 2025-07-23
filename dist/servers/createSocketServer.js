"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketServer = void 0;
const socket_io_1 = require("socket.io");
/**
 * Creates a Socket.IO server instance.
 * @param {any} server - The HTTP server to attach the Socket.IO server to.
 * @return {Server} - The created Socket.IO server instance.
 */
const createSocketServer = async (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });
    io.on('connection', (socket) => {
        console.log('a user connected');
        socket.on('disconnect', () => {
            console.log('user disconnected');
        });
    });
    return io;
};
exports.createSocketServer = createSocketServer;
//# sourceMappingURL=createSocketServer.js.map