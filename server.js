

var express = require('express');
var http = require('http');
var path = require('path');
var socketIO = require('socket.io');
const Firestore = require('@google-cloud/firestore');
var app = express();
var server = http.Server(app);
var io = socketIO(server);
//const admin = require('firebase-admin');

var port = process.env.PORT || 3000;

app.set('port', port);
app.use(express.static(path.join(__dirname, 'build')));
//console.log("yeah");
//console.log(process.env.GOOGLE_APPLICATION_CREDENTIALS);
let creds = JSON.parse(process.env.FIRESTORE_CREDENTIALS);
console.log(creds);
const db = new Firestore({
  projectId: 'chessapp-290922',
  keyFilename: 'keyfile.json',
});
/*
const docRef = db.collection('users').doc('alovelace');

docRef.set({
  first: 'Ada',
  last: 'Lovelace',
  born: 1815
});

  
const aTuringRef = db.collection('users').doc('aturing');

aTuringRef.set({
  first: 'Aln',
  middle: 'Mathison',
  last: 'Turing',
  born: 191
});
*/

  

async function testCall(target){
	const snapshot = await db.collection(target).get();
	snapshot.forEach((doc) => {
		console.log(doc.id, '=>', doc.data().first);
	});
}

//testCall('users');


  
  




// Routing
app.get('/', function(request, response) {
  response.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// Starts the server.
server.listen(port, function() {
  console.log('Starting server on port 3000');
});


async function broadcastPlayers(){
	const snapshot = await db.collection('players').get();
	let toSend = {};
	snapshot.forEach((doc) => {
		//console.log(doc.id, '=>', doc.data());
		toSend[doc.id] = doc.data();
	});
	io.sockets.emit('players', toSend);
}

async function broadcastGames(){
	const snapshot = await db.collection('games').get();
	let toSend = {};
	snapshot.forEach((doc) => {
		//console.log(doc.id, '=>', doc.data());
		toSend[doc.id] = doc.data();
	});
	io.sockets.emit('games', toSend);
	
}



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
	return array;
}


io.on('connection', function(socket) {
  socket.on('new player', function(playerName) {
    console.log(playerName);
	if (!playerName || playerName.length == 0){
		playerName = socket.id;
	}
	let playerToAdd = {
		name: playerName,
		available: true,
		challengers: [],
		currentGame: null,
	};
	io.to(socket.id).emit("getId", socket.id);
	let asyncFunc = async () => {
		let testRef = db.collection('players').doc(socket.id);
		await testRef.set(playerToAdd);
		broadcastPlayers();
		broadcastGames();
	};
	asyncFunc();
  });
  
  socket.on("localGame", function(){
	  let asyncFunc = async () => {
		  const targetDoc = await db.collection('players').doc(socket.id).get();
		  if (!targetDoc.exists){
			  return;
		  }
		  let targetData = targetDoc.data();
		  targetData.available = false;
		  const playerRef = db.collection('players').doc(socket.id);
		  await playerRef.set(targetData);
		  broadcastPlayers();
	  };
	  asyncFunc();
  });
  
  
  socket.on("challenge", function(otherPlayer) {
	  if (otherPlayer == socket.id){
		  return;
	  }
	  let asyncFunc = async () => {
		  console.log(otherPlayer);
		  //broadcastPlayers();
		  const targetDoc = await db.collection('players').doc(otherPlayer).get();
		  if (!targetDoc.exists){

			  return;
		  }
		  let otherPlayerData = targetDoc.data();
		  if (otherPlayerData.challengers.includes(socket.id)){
			  return;
		  }
		  otherPlayerData.challengers.push(socket.id);
		  const addRef = db.collection('players').doc(otherPlayer);
		  await addRef.set(otherPlayerData);
		  broadcastPlayers();
	  };
	  asyncFunc();
	  /*
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
	  */
  });
  
  socket.on("accept", function(otherPlayer){
	  
	  let asyncFunc = async () => {
		  const thisPlayerDoc = await db.collection('players').doc(socket.id).get();
		  if (!thisPlayerDoc.exists){
			  return;
		  }
		  let thisPlayerData = thisPlayerDoc.data();
		  const otherPlayerDoc = await db.collection('players').doc(otherPlayer).get();
		  if (!otherPlayerDoc.exists){
			  return;
		  }
		  let otherPlayerData = otherPlayerDoc.data();
		  let gameNum = socket.id + otherPlayer;
		  let newGame = {
			gameNumber: gameNum,
			playerNames: [otherPlayerData.name, thisPlayerData.name],
			players: [otherPlayer, socket.id],
			available: [false, false],
			moves: [],
			spectators: [],
			chat: [],
			finished: false,
		  }
		  thisPlayerData.available = false;
		  otherPlayerData.available = false;
		  thisPlayerData.currentGame = gameNum;
		  otherPlayerData.currentGame = gameNum;
		  socket.join(gameNum);
		  const thisRef = db.collection('players').doc(socket.id);
		  await thisRef.set(thisPlayerData);
		  const otherRef = db.collection('players').doc(otherPlayer);
		  await otherRef.set(otherPlayerData);
		  const gameRef = db.collection('games').doc(gameNum);
		  await gameRef.set(newGame);
		  io.to(otherPlayer).emit("started", [newGame, 0]);
		  io.to(socket.id).emit("started", [newGame, 1]);
		  broadcastPlayers();
		  broadcastGames();
	  };
	  asyncFunc();
	  
	  /*
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
	  */
  });
  
  socket.on("receivedStart", function(targetGame) {
	  console.log("Game " + targetGame + " confirmed");
	  socket.join(targetGame);
  });
  
  socket.on("move", function(move){
	  console.log(move);
	  let asyncFunc = async () => {
		  const thisPlayerDoc = await db.collection('players').doc(socket.id).get();
		  if (!thisPlayerDoc.exists){
			  return;
		  }
		  let thisGameDoc = await db.collection('games').doc(thisPlayerDoc.data().currentGame).get();
		  if (!thisGameDoc.exists){
			  return;
		  }
		  let gameData = thisGameDoc.data();
		  let newMove = {}
		  for (let i = 0; i < move.length; i++){
			  newMove[i] = move[i];
		  }
		  gameData.moves.push(newMove);
		  if (move[5]){
			  gameData.finished = true;
		  }
		  const gameRef = db.collection('games').doc(thisGameDoc.id);
		  await gameRef.set(gameData);
		  io.to(thisGameDoc.id).emit("move", move);
	  };
	  asyncFunc();
	  /*
	  let targetGame = players[socket.id].currentGame;
	  games[targetGame].moves.push(move);
	  io.to(targetGame).emit("move", move);
	  */
	  
  });
  
  socket.on("spectate", function(targetGameNum){
	  console.log("spec");
	  let asyncFunc = async () => {
		  const targetGameDoc = await db.collection('games').doc(targetGameNum).get();
		  if (!targetGameDoc.exists){
			  return;
		  }
		  let gameData = targetGameDoc.data();
		  gameData.spectators.push(socket.id);
		  socket.join(targetGameNum);
		  const thisPlayerDoc = await db.collection('players').doc(socket.id).get();
		  if (!thisPlayerDoc.exists){
			  return;
		  }
		  let thisPlayerData = thisPlayerDoc.data();
		  thisPlayerData.currentGame = targetGameNum;
		  thisPlayerData.available = false;
		  const gameRef = db.collection('games').doc(targetGameNum);
		  await gameRef.set(gameData);
		  const playerRef = db.collection('players').doc(socket.id);
		  await playerRef.set(thisPlayerData);
		  io.to(socket.id).emit("spectateInfo", gameData);
		  broadcastPlayers();
		  broadcastGames();
		  
	  };
	  asyncFunc();
	  /*
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
	  */
  });
  
  socket.on("jumpIn", function(data){
	  let targetGameNum = data[0];
	  let playerNum = data[1];
	  let asyncFunc = async () => {
		  const targetGameDoc = await db.collection('games').doc(targetGameNum).get();
		  if (!targetGameDoc.exists){
			  return;
		  }
		  let gameData = targetGameDoc.data();
		  if (!gameData.available[playerNum]){
			  return;
		  }
		  gameData.players[playerNum] = socket.id;
		  socket.join(targetGameNum);
		  const thisPlayerDoc = await db.collection('players').doc(socket.id).get();
		  if (!thisPlayerDoc.exists){
			  return;
		  }
		  let thisPlayerData = thisPlayerDoc.data();
		  thisPlayerData.currentGame = targetGameNum;
		  thisPlayerData.available = false;
		  gameData.available[playerNum] = false;
		  const gameRef = db.collection('games').doc(targetGameNum);
		  await gameRef.set(gameData);
		  const playerRef = db.collection('players').doc(socket.id);
		  await playerRef.set(thisPlayerData);
		  io.to(socket.id).emit("started", [gameData, playerNum]);
		  io.to(targetGameNum).emit("nameUpdate", [thisPlayerData.name, playerNum]);
		  broadcastPlayers();
		  broadcastGames();
		  
	  };
	  asyncFunc();
  });
  
  
  socket.on("chat", function(message){
	  console.log(message);
	  
	  
	  let asyncFunc = async () => {
		  const thisPlayerDoc = await db.collection('players').doc(socket.id).get();
		  if (!thisPlayerDoc.exists){
			  return;
		  }
		  let thisPlayerData = thisPlayerDoc.data();
		  const targetGameDoc = await db.collection('games').doc(thisPlayerData.currentGame).get();
		  if (!targetGameDoc.exists){
			  return;
		  }
		  let gameData = targetGameDoc.data();
		  let toSend = {
			  0: message, 
			  1: thisPlayerData.name
	      };
		  gameData.chat.push(toSend);
		  const gameRef = db.collection('games').doc(thisPlayerData.currentGame);
		  await gameRef.set(gameData);
		  io.to(thisPlayerData.currentGame).emit("chatUpdate", toSend);
	  };
	  asyncFunc();
	  /*
	  if (!players[socket.id]){
		  return;
	  }
	  let playerName = players[socket.id].name;
	  let thisGameNum = players[socket.id].currentGame;
	  games[thisGameNum].chat.push([message, playerName]);
	  */
  });
  
  socket.on("checkmate", function(gameNumber){
	  console.log("received checkmate from " + socket.id);
	  let asyncFunc = async () => {
		  const thisGameDoc = await db.collection('games').doc(gameNumber).get();
		  if (!thisGameDoc.exists){
			  console.log("retreival failed");
			  return;
		  }
		  console.log("retreival success");
		  console.log(gameNumber);
		  let gameData = thisGameDoc.data();
		  gameData.finished = true;
		  //console.log(gameData);
		  await db.collection('games').doc(gameData.gameNumber).set(gameData);
		  const testDoc = await db.collection('games').doc(gameNumber).get();
		  //console.log(testDoc.data());
		  //await gameRef.set(gameData);
		  
	  };
	  asyncFunc();
  });
  
  
  
  socket.on('disconnect', function(){
	  console.log("Disconnecting player " + socket.id);
	  let asyncFunc = async () => {
		  const thisPlayerDoc = await db.collection('players').doc(socket.id).get();
		  console.log("preDeleting");
		  if (!thisPlayerDoc.exists){
			  return;
		  }
		  console.log("deleting");
		  let thisPlayerData = thisPlayerDoc.data();
		  if (thisPlayerData.currentGame != null){
			  const targetGameDoc = await db.collection('games').doc(thisPlayerData.currentGame).get();
			  if (!targetGameDoc.exists){
				  await db.collection('players').doc(socket.id).delete();
				  return;
			  }
			  let gameData = targetGameDoc.data();
			  if (gameData.players.includes(socket.id)){
				  //console.log(gameData);
				  if (gameData.finished){
					  console.log("Deleting game " + gameData.gameNumber);
					let allPlayers = gameData.players.concat(gameData.spectators);
					for (let i = 0; i < allPlayers.length; i++){
					  const tempPlayerDoc = await db.collection('players').doc(allPlayers[i]).get();
					  if (!tempPlayerDoc.exists){
						  continue;
					  }
					  let tempData = tempPlayerDoc.data();
					  tempData.available = true;
					  tempData.currentGame = null;
					  await db.collection('players').doc(allPlayers[i]).set(tempData);
					}
					io.to(gameData.gameNumber).emit("gameEnd", gameData.gameNumber);
					await db.collection('games').doc(gameData.gameNumber).delete();
				  } else {
					  if (gameData.players[0] == socket.id){
						  gameData.available[0] = true;
						  io.to(gameData.gameNumber).emit("nameUpdate", [null, 0]);
					  } else {
						  gameData.available[1] = true;
						  io.to(gameData.gameNumber).emit("nameUpdate", [null, 1]);
					  }
					  const gameRef = db.collection('games').doc(gameData.gameNumber);
					  gameRef.set(gameData);
				  }
			  } else {
				  gameData.spectators = removeElement(gameData.spectators, socket.id);
				  await db.collection('games').doc(gameData.gameNumber).set(gameData);
			  }
			  
			  
		  }
		  await db.collection('players').doc(socket.id).delete();
		  broadcastPlayers();
		  broadcastGames();
	  };
	  asyncFunc();
	  
	  
	  
	  /*
	  let targetPlayer = players[socket.id];
	  if (targetPlayer.currentGame != null){
		let targetGame = games[targetPlayer.currentGame];
		if (targetGame.players.includes(socket.id)){
			console.log("gameEnd");
			console.log(targetGame);
			for (let i = 0; i < targetGame.players.length; i++){
				if (!players[targetGame.players[i]]){
					continue;
				}
				players[targetGame.players[i]].currentGame = null;
				players[targetGame.players[i]].available = true;
			}
			for (let i = 0; i < targetGame.spectators.length; i++){
				if (!players[targetGame.spectators[i]]){
					continue;
				}
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
	  */
	  
	  
  });
});