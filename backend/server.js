require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser'); // ✅ add this
const { Server } = require('socket.io');

const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(cookieParser()); // ✅ add this before routes

app.use(cors({
  origin: process.env.FRONTEND_URL, // http://localhost:5173
  credentials: true, // ✅ allows sending cookies
}));

app.use(morgan('dev'));

connectDB();

// Health
app.get('/health', (_, res) => res.json({ status: 'ok' }));

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/communities', require('./routes/communities.routes'));
app.use('/api/v1/approvals', require('./routes/approvals.routes'));
app.use('/api/v1/announcements', require('./routes/announcements.routes'));
app.use('/api/v1/issues', require('./routes/issues.routes'));
app.use('/api/v1/maintenance', require('./routes/maintenance.routes'));
app.use('/api/v1/posts', require('./routes/posts.routes'));
app.use('/api/v1/comments', require('./routes/comments.routes'));
app.use('/api/v1/complaints', require('./routes/complaints.routes'));
app.use('/api/v1/staff', require('./routes/staff.routes'));
app.use('/api/v1/notifications', require('./routes/notifications.routes'));

// Global error handler (last)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL, credentials: true },
});

io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('🔴 Socket disconnected'));
});

const PORT = process.env.PORT || 3551;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
