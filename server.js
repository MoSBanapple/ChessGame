var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');

var app = express();
var server = http.Server(app);
var io = socketIO(server);

var port = process.env.PORT || 3000;

app.set('port', port);
app.use(express.static(path.join(__dirname, 'build')));

// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port 3000');
});

var playerList = []

io.on('connection', function(socket) {
  socket.on('new player', function(playerName) {
    console.log(playerName);
	playerList.push(playerName);
	io.sockets.emit("players", playerList);
  });
});