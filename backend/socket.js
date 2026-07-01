const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        io = new Server(httpServer, {
            cors: {
                origin: ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"],
                credentials: true,
                methods: ["GET", "POST"]
            }
        });

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);

            // Allow client to join a specific room (e.g. user ID or community ID)
            socket.on('join', (room) => {
                socket.join(room);
                console.log(`Socket ${socket.id} joined room ${room}`);
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected');
            });
        });

        return io;
    },
    getIO: () => {
        if (!io) {
            throw new Error('Socket.io not initialized!');
        }
        return io;
    }
};
