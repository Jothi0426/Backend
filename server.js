const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

require('./db'); // MongoDB connection

const mapRoutes = require('./routes/mapRoutes'); // Importing map routes
const { socketHandler } = require('./controllers/socketController');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());
app.use('/', mapRoutes);

socketHandler(io); // socket controller

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
