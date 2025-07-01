const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const mapRoutes = require('./routes/mapRoutes');
const { handleSocketConnection } = require('./controllers/socketController');

// Connect to MongoDB
connectDB();

// App and Middleware
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/', mapRoutes);

// Socket.IO
io.on('connection', (socket) => handleSocketConnection(io, socket));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
