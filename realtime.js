const { Server } = require('socket.io');

let io;

function initRealtime(server) {
  io = new Server(server, {
    cors: { origin: '*' }
  });

  io.on('connection', (socket) => {
    socket.on('join', ({ userId }) => {
      if (!userId) return;
      const room = `user_${userId}`;
      socket.join(room);
    });
  });
}

function getIO() {
  return io;
}

module.exports = { initRealtime, getIO };
