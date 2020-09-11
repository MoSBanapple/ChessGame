import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Piece, ChessGame} from './Chess.js';
import pieceImages from './images.js';




class Square extends React.Component {
	render(){
		return (
			<img src={this.props.image} style={this.props.style} className="square" onClick = {() => this.props.onClick()} />
		);
	}
}

function chessNotation(x, y){
	return String.fromCharCode(65+y) + (x + 1);
	
}

class TestChess extends React.Component {
	constructor(props){
		super(props);
		this.chess = new ChessGame();
		this.pieceDict = {
			0: 'Pawn',
			1: 'Rook',
			2: 'Knight',
			3: 'Bishop',
			4: 'Queen',
			5: 'King'
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
			this.setState({
				isSecondClick: false,
				firstClickX: -1,
				firstClickY: -1
			});
		} else {
			if (this.chess.board[x][y] && this.chess.board[x][y].color == this.chess.currentTurn){
			this.setState({
				firstClickX: x,
				firstClickY: y,
				isSecondClick: true,
			});
			}
		}
	}
	
	renderSquare(i, image, x, y){
		let thisStyle = {backgroundColor: 'white'};
		if (this.state.firstClickX == x && this.state.firstClickY == y){
			thisStyle.backgroundColor = 'yellow';
		}
			return <Square 
				value={i}
				image={image}
				style={thisStyle}
				onClick = {() => this.handleClick(x, y)}
			/>;

	}
	
	renderChessBoard(board){
		let output = [];
		for (let i = 0; i < board.length; i++){
			let opline = []
			for (let j = 0; j < board[i].length; j++){
				if (!board[i][j]){
					opline.push([null, null]);
				} else {
					opline.push([board[i][j].color, board[i][j].type]);
				}
			}
			output.push(opline);
		}
		output.reverse();
		let outputWritten = output.map((arr, i) => <span>{
			arr.map((block, j) => {
				if (block[1] != null){
					return this.renderSquare(block[1], pieceImages[block[0]*6 + block[1]], 7-i, j);
				} else {
					return this.renderSquare(block[1], pieceImages[12], 7-i, j);
				}
			})
			}<br/></span>);
		return (<div>{outputWritten}</div>);
	}
	
	renderHistory(){
		let hist = []
		for (let i = 0; i < this.chess.moveHistory.length; i++){
			hist.unshift(this.chess.moveHistory[i]);
		}
		let output = hist.map((arr) => {
			let str = ""
			str += chessNotation(arr[0], arr[1]) + " to " + chessNotation(arr[2], arr[3]);
			if (arr[4] >= 0){
				str += ", " + this.pieceDict[arr[4]];
			}
			return (<li>{str}</li>);
		});
		return (<ul>{output}</ul>);
	}
	
	render () {
		return (
			<div className="parent">
			<div className="historySpace">{this.renderHistory()}</div>
			<div className="gameSpace">
			<div className="infoBox">
			White<br/>
			Time: {this.chess.times[0]/1000}<br/>
			Points: {this.chess.points[0]}
			</div>
			<div className="buffer"/>
			<div className="infoBox">
			Black<br/>
			Time: {this.chess.times[1]/1000}<br/>
			Points: {this.chess.points[1]}
			</div>
			<div>
			{this.renderChessBoard(this.chess.board)}
			
			</div>
			<p>{this.chess.message}</p>
			</div>
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
