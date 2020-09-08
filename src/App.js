import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Piece, ChessGame} from './Chess.js';


class TestClass extends React.Component {
	render() {
		return (
			<div>Ablong</div>
		);
	}
}

class Square extends React.Component {
	render(){
		return (
			<button className="square" onClick = {() => this.props.onClick()} >
			{this.props.value}
			</button>
		);
	}
}

function hasWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return true;
    }
  }
  return false;
}


class Board extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			squares: Array(9).fill(null),
			complete: false,
			currentTurn: 0,
			numTurns: 0,
		}
	}
	
	getPlayer(){
		if (this.state.currentTurn == 0){
			return "X";
		}
		return "O";
	}
	
	handleClick(i){
		if (this.state.complete || this.state.numTurns >= 9){
			return;
		}
		const squares = this.state.squares.slice();
		if (squares[i] != null){
			return;
		}
		squares[i] = this.getPlayer();
		if (hasWinner(squares)){
			this.setState({complete: true});
		} else {
			this.setState({currentTurn: (this.state.currentTurn+1)%2, numTurns: this.state.numTurns + 1});
		}
		this.setState({squares: squares});
	}
	
	renderSquare(i){
		return <Square 
			value={this.state.squares[i]}
			onClick = {() => this.handleClick(i)}
		/>;
	}
	
	render(){
    let currentStatus = '';
	let controllingPlayer = this.getPlayer();
	if (this.state.complete){
		currentStatus = "Game over! " + controllingPlayer + " wins";
	} else if (this.state.numTurns >= 9){
		currentStatus = "Game over! Tie!";
	} else if (this.state.currentTurn == 0){
		currentStatus = "Next turn: X";
	} else {
		currentStatus = "Next turn: O";
	}

    return (
      <div>
        <div className="status">{currentStatus}</div>
        <div className="board-row">
          {this.renderSquare(0)}
          {this.renderSquare(1)}
          {this.renderSquare(2)}
        </div>
        <div className="board-row">
          {this.renderSquare(3)}
          {this.renderSquare(4)}
          {this.renderSquare(5)}
        </div>
        <div className="board-row">
          {this.renderSquare(6)}
          {this.renderSquare(7)}
          {this.renderSquare(8)}
        </div>
      </div>
    );
	}
}

class TestChess extends React.Component {
	constructor(props){
		super(props);
		this.chess = new ChessGame();
		this.pieceDict = {
			0: 'P',
			1: 'R',
			2: 'H',
			3: 'B',
			4: 'Q',
			5: 'K'
		}
		this.state = {
			isSecondClick: false,
			firstClickX: -1,
			firstClickY: -1,
		};
	}
	handleClick(x, y){
		console.log(x, y);
		if (this.state.isSecondClick){
			if (!(x == this.state.firstClickX && y == this.state.firstClickY)){
				this.chess.makeMove(this.state.firstClickX, this.state.firstClickY, x, y);
			}
			this.setState({isSecondClick: false});
		} else {
			if (this.chess.board[x][y]){
			this.setState({
				firstClickX: x,
				firstClickY: y,
				isSecondClick: true,
			});
			}
		}
	}
	
	renderSquare(i, x, y){

			return <Square 
				value={i}
				onClick = {() => this.handleClick(x, y)}
			/>;

	}
	
	renderChessBoard(board){
		let output = [];
		for (let i = 0; i < board.length; i++){
			let opline = []
			for (let j = 0; j < board[i].length; j++){
				if (!board[i][j]){
					opline.push([0, null]);
				} else {
					opline.push([board[i][j].color, this.pieceDict[board[i][j].type]]);
				}
			}
			output.push(opline);
		}
		let outputWritten = output.map((arr, i) => <span>{
			arr.map((block, j) => {
				if (block[0] == 0){
					return this.renderSquare(block[1], i, j);
				} else {
					return this.renderSquare(block[1].toLowerCase(), i, j);
				}
			})
			}<br/></span>);
		return (<div>{outputWritten}</div>);
	}
	
	render () {
		return (
			<div>
			{this.renderChessBoard(this.chess.board)}
			</div>
		);
	}
}

function App() {
  return (
    <div>
      <header className="App-header">
		<TestChess/>
      </header>
    </div>
  );
}

export default App;
