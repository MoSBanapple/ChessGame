import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {Piece, ChessGame} from './Chess.js';
import pieceImages from './images.js';
import ChessComponent from './ChessComponent.js';
import socketIOClient from "socket.io-client";
const ENDPOINT = "/";





function App() {
	const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);
  return (
    <div>
      <header className="App-header">
		It's <time dateTime={response}>{response}</time>
      </header>
    </div>
  );
}

export default App;
