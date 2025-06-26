const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('./db'); // connect MongoDB

const socketController = require('./controllers/socketController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.use('/', require('./routes/mapRoutes'));

io.on('connection', (socket) => {
  console.log('📡 Client connected:', socket.id);
  socketController.handleSocketEvents(io, socket);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
