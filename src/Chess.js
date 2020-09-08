
export class Piece {
	constructor(color, type){
		this.color = color;
		this.type = type;
		this.moved = false;
		this.passant = false;
		
	}
	//pawn = 0, rook = 1, knight = 2, bishop = 3, queen = 4, king = 5
	//white = 0, black = 1
	
}



export class ChessGame {
	constructor(){
		this.initializeBoard();
	}
	
	initializeBoard(){
		this.currentTurn = 0;
		this.boardHistory = [];
		this.points = [0, 0];
		this.board = new Array(8);
		for (let i = 0; i < 8; i++){
			this.board[i] = new Array(8).fill(null);
		}
		for (let i = 0; i < 2; i++){
			this.board[i*7][0] = new Piece(i, 1);
			this.board[i*7][1] = new Piece(i, 2);
			this.board[i*7][2] = new Piece(i, 3);
			this.board[i*7][3] = new Piece(i, 4);
			this.board[i*7][4] = new Piece(i, 5);
			this.board[i*7][5] = new Piece(i, 3);
			this.board[i*7][6] = new Piece(i, 2);
			this.board[i*7][7] = new Piece(i, 1);
		}
		for (let i = 0; i < 8; i++){
			this.board[1][i] = new Piece(0, 0);
			this.board[6][i] = new Piece(1, 0);
		}
	}
	
	isValidSpace(x, y){
		return (x < 8 && x >= 0 && y < 8 && y >= 0 && !this.board[x][y]);
	}
	
	isInBoard(x, y){
		return (x < 8 && x >= 0 && y < 8 && y >= 0);
	}
	
	getPossibleMoves(x, y){
		let targetPiece = this.board[x][y];
		if (!targetPiece){
			return null;
		}
		let moves = [];
		switch(targetPiece.type){
			case 0:
				let modifier = 1 - (targetPiece.color*2);
				if (this.isValidSpace(x + modifier, y)){
					moves.push([x + modifier, y]);
					if (!targetPiece.moved && this.isValidSpace(x + (modifier*2), y)){
						moves.push([x + (modifier*2), y])
					}
				}
				if (y + 1 < 8 && this.board[x+modifier][y+1] && this.board[x+modifier][y+1].color != targetPiece.color){
					moves.push([x+modifier, y+1]);
				}
				if (y - 1 >= 0 && this.board[x+modifier][y-1] && this.board[x+modifier][y-1].color != targetPiece.color){
					moves.push([x+modifier, y-1]);
				}
				if (y + 1 < 8 && !this.board[x+modifier][y+1] && this.board[x][y+1] && this.board[x][y+1].passant){
					moves.push([x+modifier, y+1]);
				}
				if (y - 1 >= 0 && !this.board[x+modifier][y-1] && this.board[x][y-1] && this.board[x][y-1].passant){
					moves.push([x+modifier, y-1]);
				}
				break;
			case 1:
				for (let d = -1; d < 2; d++){
					for (let e = -1; e < 2; e++){
						if (!(d == 0 || e == 0)){
							continue;
						}
						if (d == e){
							continue;
						}
						for (let i = 1; i < 8; i++){
							moves.push([x + (d*i), y + (e*i)]);
							if (!this.isInBoard(x + (d*i), y + (e*i)) || this.board[x + (d*i)][y + (e*i)]){
								break;
							}
						}
					}
				}
				break;
			case 2:
				moves.push([x+1, y+2]);
				moves.push([x+2, y+1]);
				moves.push([x+1, y-2]);
				moves.push([x+2, y-1]);
				moves.push([x-1, y+2]);
				moves.push([x-2, y+1]);
				moves.push([x-1, y-2]);
				moves.push([x-2, y-1]);
				break;
			case 3:
				for (let d = -1; d < 2; d++){
					for (let e = -1; e < 2; e++){
						if (d == 0 || e == 0){
							continue;
						}
						for (let i = 1; i < 8; i++){
							moves.push([x + (d*i), y + (e*i)]);
							if (!this.isInBoard(x + (d*i), y + (e*i)) || this.board[x + (d*i)][y + (e*i)]){
								break;
							}
						}
					}
				}
				break;
			case 4:
				for (let d = -1; d < 2; d++){
					for (let e = -1; e < 2; e++){
						if (d == 0 && e == 0){
							continue;
						}
						for (let i = 1; i < 8; i++){
							moves.push([x + (d*i), y + (e*i)]);
							if (!this.isInBoard(x + (d*i), y + (e*i)) || this.board[x + (d*i)][y + (e*i)]){
								break;
							}
						}
					}
				}
				break;
			case 5:
				for (let d = -1; d < 2; d++){
					for (let e = -1; e < 2; e++){
						if (d == 0 && e == 0){
							continue;
						}
						moves.push([x + d, y+ e]);
					}
				}
				
				break;
			
		}
		for (let i = 0; i < moves.length; i++){
			let target = moves[i];
			if (!this.isInBoard(target[0], target[1]) || (this.board[target[0]][target[1]] && this.board[target[0]][target[1]].color == targetPiece.color)){
				moves.splice(i, 1);
				i--;
			}
		}
		return moves;
	}
	
	makeMove(x1, y1, x2, y2){
		if (!this.isInBoard(x1, y1) || !this.isInBoard(x2, y2)){
			console.log("Destination not in board");
			return false;
		}
		if (!this.board[x1][y1]){
			console.log("No piece there");
			return false;
		}
		let targetPiece = this.board[x1][y1];
		if (targetPiece.color != this.currentTurn){
			console.log("Not that color's turn");
			return false;
		}
		let beforeBoard = this.getBoardCopy();
		let addPoints = 0;
		let pointValues = [1, 5, 3, 3, 9, 10];
		if (targetPiece.type == 5 && (x1 == this.currentTurn*7 && y1 == 4) && this.board[x2][y2] && x2 == x1 && (y2 == 0 || y2 == 7)){
			if (this.canCastle(this.currentTurn, y2/7)){
				let targetRook = this.board[x2][y2];
				targetPiece.moved = true;
				targetRook.moved = true;
				if (y2 == 7){
					this.board[x1][y1 + 2] = targetPiece;
					this.board[x1][y1 + 1] = targetRook;
				} else {
					this.board[x1][y1 - 2] = targetPiece;
					this.board[x1][y1 - 1] = targetRook;
				}
				this.board[x1][y1] = null;
				this.board[x2][y2] = null;
			} else {
				console.log("Impossible move");
				return false;
			}
		} else {
			let availableMoves = this.getPossibleMoves(x1, y1);
			//console.log(availableMoves);
			let possible = false;
			for (let i = 0; i < availableMoves.length; i++){
				if (availableMoves[i][0] == x2 && availableMoves[i][1] == y2){
					possible = true;
					break;
				}
			}
			if (!possible){
				console.log("Impossible move");
				return false;
			}
		
			if (targetPiece.type == 0 && Math.abs(x1-x2) == 2){
				targetPiece.passant = true;
			}
			if (targetPiece.type == 0 && y1 != y2 && !this.board[x2][y2]){
				
				this.board[x1][y2] = null;
				addPoints = 1;
			}
			targetPiece.moved = true;
			if (this.board[x2][y2]){
				addPoints = pointValues[this.board[x2][y2].type];
			}
			this.board[x2][y2] = targetPiece;
			this.board[x1][y1] = null;
		}
		if (this.isKingChecked(this.currentTurn)){
			this.board = beforeBoard;
			console.log("King checked, can't do that");
			return false;
		}
		if (targetPiece.type == 0 && (x2 == 0 || x2 == 7)){
			this.board[x2][y2].type = 4;
		}
		this.points[this.currentTurn] += addPoints;
		this.currentTurn = 1 - this.currentTurn;
		this.clearPassant(this.currentTurn);
		this.boardHistory.push(beforeBoard);
		if (this.isCheckmated(this.currentTurn)){
			console.log("Checkmate on " + this.currentTurn);
		} else if (this.isStalemated(this.currentTurn)){
			console.log("Stalemate");
		}
		console.log("Points: " + this.points[0] + ", " + this.points[1]);
		return true;
	}
	
	isSpotChecked(x, y, color){
		let availableMoves = []
		for (let i = 0; i < 8; i++){
			for (let j = 0; j < 8; j++){
				let targetPiece = this.board[i][j];
				if (!targetPiece){
					continue;
				}
				if (targetPiece.color != color){
					let toAdd = this.getPossibleMoves(i, j);
					availableMoves = availableMoves.concat(toAdd);
				}
			}
		}
		for (let i = 0; i < availableMoves.length; i++){
			if (availableMoves[i][0] == x && availableMoves[i][1] == y){
				return true;
			}
		}
		return false;
	}
	
	locateKing(color){
		let kingX = 0;
		let kingY = 0;
		for (let i = 0; i < 8; i++){
			for (let j = 0; j < 8; j++){
				let targetPiece = this.board[i][j];
				if (!targetPiece){
					continue;
				}
				if (targetPiece.color == color && targetPiece.type == 5){
					kingX = i;
					kingY = j;
				}
			}
		}
		return [kingX, kingY];
	}
	
	isKingChecked(color){
		let kingCoordinates = this.locateKing(color);
		//console.log("King is at " + kingX + ", " + kingY);
		let output = this.isSpotChecked(kingCoordinates[0], kingCoordinates[1], color);
		//console.log(output);
		return output;
	}
	
	isCheckmated(color){
		return (this.isKingChecked(color) && this.isStalemated(color));
	}
	
	isStalemated(color){
		let checkMated = true;
		for (let i = 0; i < this.board.length; i++){
			for (let j = 0; j < this.board.length; j++){
				if (!this.board[i][j] || this.board[i][j].color != color){
					continue;
				}
				let moves = this.getPossibleMoves(i, j);
				for (const move of moves){
					let temp = this.board[move[0]][move[1]];
					this.board[move[0]][move[1]] = this.board[i][j];
					this.board[i][j] = null;
					if (!this.isKingChecked(color)){
						console.log(i, j);
						checkMated = false;
					}
					this.board[i][j] = this.board[move[0]][move[1]];
					this.board[move[0]][move[1]] = temp;
					if (!checkMated){
						return false;
					}
				}
			}
		}
		return checkMated;
	}
	
	canCastle(color, side){
		if (this.isKingChecked(color)){
			return false;
		}
		let x = color*7;
		if (this.board[x][4].moved || this.board[x][side*7].moved){
			return false;
		}
		for (let i = 4 + ((side*2) - 1); i != side*7; i += (side*2) - 1){
			if (this.board[x][i] != null || this.isSpotChecked(x, i, color)){
				return false;
			}
		}
		return true;
	}
	
	
	getBoardCopy(){
		var newBoard = new Array(8);
		for (let i = 0; i < this.board.length; i++){
			var newRow = new Array(8);
			for (let j = 0; j < this.board[i].length; j++){
				let targetPiece = this.board[i][j];
				if (!targetPiece){
					newRow[j] = null;
					continue;
				}
				newRow[j] = new Piece(targetPiece.color, targetPiece.type);
				newRow[j].moved = targetPiece.moved;
				newRow[j].passant = targetPiece.passant;
			}
			newBoard[i] = newRow;
		}
		return newBoard;
	}
	
	clearPassant(color){
		for (let i = 0; i < this.board.length; i++){
			for (let j = 0; j < this.board.length; j++){
				if (this.board[i][j] && this.board[i][j].color == color){
					this.board[i][j].passant = false;
				}
			}
		}
	}
	
	
}