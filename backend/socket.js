const { Server } = require('socket.io');

let io;

module.exports = {
    init: (httpServer) => {
        const allowedOrigins = [
            "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176",
            "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://127.0.0.1:5176",
            "https://visionary-douhua-a7e11b.netlify.app"
        ];

        io = new Server(httpServer, {
            cors: {
                origin: (origin, callback) => {
                    if (!origin) return callback(null, true);
                    const isAllowed = allowedOrigins.includes(origin) || 
                                      origin.endsWith('.netlify.app') || 
                                      origin.includes('netlify.app');
                    if (isAllowed) {
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                },
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
