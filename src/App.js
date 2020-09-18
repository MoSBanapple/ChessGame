import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {Piece, ChessGame} from './Chess.js';
import pieceImages from './images.js';
import ChessComponent from './ChessComponent.js';
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://localhost:3000";

var socket = socketIOClient(ENDPOINT);



function App() {
	socket.emit("new player", "yeahhh boy");
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
		
		<ChessComponent/>
      </header>
    </div>
  );
}

export default App;
