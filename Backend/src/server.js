require('dotenv').config();

const express = require('express');
const http = require('http');
const helmet = require('helmet');
const cors = require('cors');
const { Server } = require('socket.io');

const sessionRoutes = require('./routes/session.routes');
const socketHandler = require('./websocket/socket.handler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7,
});

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/session', sessionRoutes);

io.on('connection', (socket) => {
  socketHandler(socket, io);
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});