import { Server } from 'socket.io';

/**
 * Creates a Socket.IO server instance.
 * @param {any} server - The HTTP server to attach the Socket.IO server to.
 * @return {Server} - The created Socket.IO server instance.
 */
export const createSocketServer = async (server: any): Promise<Server> => {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  })
  io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
  return io;
};