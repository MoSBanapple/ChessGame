

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

var gameNum = 1;

var players = {}
var games = {}

function removeElement(array, elem) {
	
    var index = -1;
	for (let i = 0; i < array.length; i++){
		if (array[i] == elem){
			index = i;
		}
	}
    if (index > -1) {
        array.splice(index, 1);
    }
}


io.on('connection', function(socket) {
  socket.on('new player', function(playerName) {
    console.log(playerName);
	if (!playerName || playerName.length == 0){
		playerName = socket.id;
	}
	players[socket.id] = {
		name: playerName,
		available: true,
		challengers: [],
		currentGame: null,
	};
	io.to(socket.id).emit("getId", socket.id);
	io.sockets.emit("players", players);
	io.sockets.emit("games", games);
  });
  
  
  socket.on("challenge", function(otherPlayer) {
	  console.log(players[socket.id].name + " is challenging " + players[otherPlayer].name);
	  if (otherPlayer == socket.id){
		  return;
	  }
	  let targetPlayer = players[otherPlayer];
	  for (let i = 0; i < targetPlayer.challengers.length; i++){
		  if (targetPlayer.challengers[i] == socket.id){
			  return;
		  }
	  }
	  players[otherPlayer].challengers.push(socket.id);
	  io.sockets.emit("players", players);
  });
  
  socket.on("accept", function(otherPlayer){
	  console.log("Game " + gameNum + " started between " + players[otherPlayer].name + " and " + players[socket.id].name);
	  games[gameNum] = {
		  gameNumber: gameNum,
		  players: [otherPlayer, socket.id],
		  moves: [],
		  spectators: [],
		  chat: [],
	  }
	  players[socket.id].available = false;
	  players[otherPlayer].available = false;
	  
	  players[socket.id].currentGame = gameNum;
	  players[otherPlayer].currentGame = gameNum;
	  socket.join(gameNum);
	  io.to(otherPlayer).emit("started", [games[gameNum], 0]);
	  io.to(socket.id).emit("started", [games[gameNum], 1]);
	  gameNum += 1;
	  io.sockets.emit("players", players);
	  io.sockets.emit("games", games);
  });
  
  socket.on("receivedStart", function(targetGame) {
	  console.log("Game " + targetGame + " confirmed");
	  socket.join(targetGame);
  });
  
  socket.on("move", function(move){
	  let targetGame = players[socket.id].currentGame;
	  games[targetGame].moves.push(move);
	  io.to(targetGame).emit("move", move);
	  console.log(move);
  });
  
  socket.on("spectate", function(targetGameNum){
	  console.log("spec");
	  let targetGame = games[targetGameNum];
	  if (!games[targetGameNum]){
		  return;
	  }
	  games[targetGameNum].spectators.push(socket.id);
	  socket.join(targetGameNum);
	  players[socket.id].currentGame = targetGameNum;
	  players[socket.id].available = false;
	  io.to(socket.id).emit("spectateInfo", targetGame);
	  io.sockets.emit("players", players);
  });
  
  socket.on("chat", function(message){
	  console.log(message);
	  let playerName = players[socket.id].name;
	  let thisGameNum = players[socket.id].currentGame;
	  games[thisGameNum].chat.push([message, playerName]);
	  io.to(thisGameNum).emit("chatUpdate", [message, playerName]);
  });
  
  
  
  socket.on('disconnect', function(){
	  if (!(socket.id in players)){
		  io.sockets.emit("players", players);
		return;
		
	  }
	  
	  let targetPlayer = players[socket.id];
	  if (targetPlayer.currentGame != null){
		let targetGame = games[targetPlayer.currentGame];
		if (targetGame.players.includes(socket.id)){
			console.log("gameEnd");
			console.log(targetGame);
			for (let i = 0; i < targetGame.players.length; i++){
				players[targetGame.players[i]].currentGame = null;
				players[targetGame.players[i]].available = true;
			}
			for (let i = 0; i < targetGame.spectators.length; i++){
				players[targetGame.spectators[i]].currentGame = null;
				players[targetGame.spectators[i]].available = true;
			}
			io.to(targetGame.gameNumber).emit("gameEnd", targetPlayer.currentGame);
			delete games[targetGame];
		} else {
			removeElement(games[targetPlayer.currentGame], socket.id);
		}
	  }
	  delete players[socket.id];
	  console.log(players);
	  io.sockets.emit("players", players);
	  io.sockets.emit("games", games);
	  
	  
	  
  });
});