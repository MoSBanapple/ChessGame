import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {Piece, ChessGame} from './Chess.js';
import pieceImages from './images.js';
import ChessComponent from './ChessComponent.js';
import socketIOClient from "socket.io-client";
const ENDPOINT = "/";

var socket = socketIOClient(ENDPOINT);

class PlayerList extends React.Component {
	constructor(props){
		super(props);
		
		this.playerName = prompt("Please enter your name", "");
		this.playerId = null;
		if (!this.playerName || this.playerName.length == 0){
			this.playerName = Math.random().toString(36).substring(7);
		}
		if (this.playerName.length > 25){
			this.playerName = this.playerName.substring(0, 25);
		}
	    
		this.state = {
			players: {},
			games: {},
			localGame: false,
		};
		this.playerNumber = 0;
		this.foundGame = false;
		this.gameInfo = null;
		socket.on("players", function(players){
			console.log("gotPlayers");
			this.setState({players: players});
		}.bind(this));
		socket.on("games", function(games){
			this.setState({games: games});
		}.bind(this));
		socket.on("getId", function(id){
			this.playerId = id;
		}.bind(this));
		socket.on("started", function(rec){
			this.gameInfo = rec[0];
			this.playerNumber = rec[1];
			this.foundGame = true;
			console.log("started " + this.gameInfo.gameNumber);
			socket.emit("receivedStart", this.gameInfo.gameNumber);
		}.bind(this));
		
		socket.on("spectateInfo", function(specInfo){
			this.gameInfo = specInfo;
			this.playerNumber = 3;
			this.foundGame = true;
			console.log("Specating " + this.gameInfo.gameNumber);
		}.bind(this));
		
		socket.on("gameEnd", function(gameNum){
			console.log("game ended");
			this.foundGame = false;
			this.playerInfo = null;
			this.playerNumber = 0;
		}.bind(this));
		socket.on("testRec", function(rec){
			console.log(rec);
		}.bind(this));
		
		
		socket.emit("new player", this.playerName);
	}
	
	handleChallenge(player){
		console.log("Challenging " + this.state.players[player].name);
		socket.emit("challenge", player);
	}
	
	handleAccept(player){
		console.log("Accepting " + this.state.players[player].name);
		socket.emit("accept", player);
	}
	
	handleSpectate(specNum){
		console.log("Trying to spectate " + specNum);
		socket.emit("spectate", specNum);
	}
	
	handleJumpin(targetGame, playerNum){
		console.log("Jumping in " + targetGame + " on " + playerNum);
		socket.emit("jumpIn", [targetGame, playerNum]);
	}
	
	handleLocal(){
		this.setState({localGame: true});
	}
	
	renderPlayers(){
		let output = [];
		if (!this.state.players[this.playerId]){
			return null;
		}
		let challengeList = this.state.players[this.playerId].challengers;
		for (let player in this.state.players){
			let targetPlayer = this.state.players[player];
			let challengeText = "";
			if (player == this.playerId || !targetPlayer.available){
				continue;
			}
			let challengeButton = (<button onClick={() => this.handleChallenge(player)}>Challenge</button>);
			if (challengeList.includes(player)){
				challengeText = " is challenging you!";
				challengeButton = (<button onClick={() => this.handleAccept(player)}>Accept challenge</button>);
			}
			output.push((<li>
				{targetPlayer.name + challengeText}
				&nbsp;
				{challengeButton}
			</li>));
			
		}
		return (<ul>{output}</ul>);
	}
	
	renderGames(){
		let output = [];
		for (let game in this.state.games){
			let targetGame = this.state.games[game];
			let gameText = targetGame.playerNames[0] + " VS " + targetGame.playerNames[1];
			let spectateButton = (<button onClick={() => this.handleSpectate(game)}>Spectate</button>);
			let whiteButton = null;
			if (targetGame.available[0]){
				whiteButton = (<button onClick={() => this.handleJumpin(game, 0)}>Play as White</button>);
			}
			let blackButton = null;
			if (targetGame.available[1]){
				whiteButton = (<button onClick={() => this.handleJumpin(game, 1)}>Play as Black</button>);
			}
			output.push((<li>
			{gameText}&nbsp;{spectateButton}&nbsp;{whiteButton}&nbsp;{blackButton}
			</li>));
		}
		return (<ul>{output}</ul>);
	}
	
	
	
	render(){
		
		if (this.state.localGame){
			return (<div><ChessComponent/></div>);
		}
		if (this.foundGame){
			console.log("should be starting chess");
			let whiteName = null;
			if (this.state.players[this.gameInfo.players[0]]){
				whiteName = this.state.players[this.gameInfo.players[0]].name;
			}
			let blackName = null;
			if (this.state.players[this.gameInfo.players[1]]){
				blackName = this.state.players[this.gameInfo.players[1]].name;
			}
			let insertBoard = new ChessGame();
			for (let i = 0; i < this.gameInfo.moves.length; i++){
				let targetMove = this.gameInfo.moves[i];
				insertBoard.makeMove(targetMove[0], targetMove[1], targetMove[2], targetMove[3]);
			}
			
			let thisGame = (<ChessComponent
				player={this.playerNumber}
				whiteName={whiteName}
				blackName={blackName}
				socket={socket}
				chess={insertBoard}
				chat={this.gameInfo.chat}
				gameInfo={this.gameInfo}
				/>);
			return (<div>{thisGame}</div>);
		}
		return (
			<div>
			<h1>Chess</h1>
			<button onClick={() => this.handleLocal()}>Local Game</button>
			<h5>Players</h5>
			{this.renderPlayers()}
			<h5>Games</h5>
			{this.renderGames()}
			</div>
		);
	}
}

/*
class GameList extends React.Component {
	constructor(props){
	}
	
}
*/


function App() {
	
	console.log("yo");
	
		
	var chessInsert = new ChessGame();
	chessInsert.makeMove(1, 5, 2, 5);
	chessInsert.makeMove(6, 4, 5, 4);
	var chessComp = (<ChessComponent/>);

  return (
    <div>
      <header className="App-header">
		<PlayerList/>
      </header>
    </div>
  );
}

export default App;
