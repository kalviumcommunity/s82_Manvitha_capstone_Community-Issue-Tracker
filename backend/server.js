require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
// const { Server } = require('socket.io'); // Moved to socket.js

const connectDB = require('./config/db');

const app = express();
app.use(express.json());
app.use(cookieParser()); // ✅ add this before routes

// Remove any other app.use(cors(...)) lines
const allowedOrigins = [
  "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176",
  "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://127.0.0.1:5175", "http://127.0.0.1:5176"
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or curl)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.includes(origin) || 
                      origin.endsWith('.netlify.app') || 
                      origin.includes('netlify.app');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, false); // Block other origins safely without crashing
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
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
app.use('/api/v1', require('./routes/ai.routes'));

// Global error handler (last)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    const cleanMessage = messages.join('. ').replace(/`/g, "'");
    return res.status(400).json({ message: cleanMessage });
  }

  // Handle Mongoose Duplicate Key Error
  if (err.code && err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const cleanField = field.charAt(0).toUpperCase() + field.slice(1);
    return res.status(400).json({ message: `${cleanField} already exists.` });
  }

  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const server = http.createServer(app);
const socket = require('./socket');
const io = socket.init(server);

const PORT = process.env.PORT || 3551;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
