const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./db');

const app = express();
app.use(cors());
connectDB();

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

const { handleSocketConnection } = require('./controllers/locationController');

io.on('connection', (socket) => {
  handleSocketConnection(io, socket); // ✅ This connects to the frontend socket
});

app.use('/auth', require('./routes/userRoutes'));


const PORT = 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
