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
		this.state = {
			players: {},
		};
		socket.on("players", function(players){
			this.setState({players: players});
		}.bind(this));
	}
	
	renderPlayers(){
		let output = []
		
		for (var id in this.state.players){
			output.push((<li>{this.state.players[id].name}</li>));
		}
		return (<ul>{output}</ul>);
	}
	
	render(){
		return (
			<div>{this.renderPlayers()}</div>
		);
	}
}



function App() {
	var playerName = prompt("Please enter your name", "");
	socket.emit("new player", playerName);
	console.log("yo");
	/*
	const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);
  */
  //It's <time dateTime={response}>{response}</time>
  return (
    <div>
      <header className="App-header">
		<PlayerList/>
      </header>
    </div>
  );
}

export default App;
