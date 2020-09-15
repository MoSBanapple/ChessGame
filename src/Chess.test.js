import {Piece, ChessGame} from './Chess.js';

let chess = new ChessGame();



test("InitialTest", () => {
	chess.initializeBoard();
	expect(chess.currentTurn).toEqual(0);
	expect(chess.boardHistory.length).toEqual(0);
	expect(chess.moveHistory.length).toEqual(0);
	for (let i = 0; i < chess.board.length; i++){
		for (let j = 0; j < chess.board.length; j++){
			let target = chess.board[i][j];
			if (i > 1 && i < 6){
				expect(target).toEqual(null);
				continue;
			}
			expect(target.moved).toEqual(false);
			expect(target.passant).toEqual(false);
			if (i == 1 || i == 6){
				expect(target.type).toEqual(0);
			} else if (i == 0 || i == 7){
				let arr = [1, 2, 3, 4, 5, 3, 2, 1];
				expect(target.type).toEqual(arr[j]);
			}
		}
	}
});

test("PawnMove", () => {
	chess.initializeBoard();
	expect(chess.makeMove(1, 2, 2, 3)).toEqual(false);
	expect(chess.makeMove(1, 2, 2, 2)).toEqual(true);
	expect(chess.makeMove(6, 3, 4, 3)).toEqual(true);
	expect(chess.makeMove(2, 2, 3, 2)).toEqual(true);
	expect(chess.makeMove(4, 3, 3, 2)).toEqual(true);
	expect(chess.board[3][2].color).toEqual(1);
	expect(chess.points[1]).toEqual(1);
	expect(chess.makeMove(1, 6, 3, 6)).toEqual(true);
	expect(chess.makeMove(6, 6, 5, 6)).toEqual(true);
	expect(chess.makeMove(3, 6, 4, 6)).toEqual(true);
	expect(chess.makeMove(6, 7, 4, 7)).toEqual(true);
	expect(chess.makeMove(4, 6, 5, 7)).toEqual(true);
	expect(chess.points[0]).toEqual(1);
});

test("RookMove", () => {
	chess.initializeBoard();
	expect(chess.makeMove(0, 0, 2, 0)).toEqual(false);
	expect(chess.makeMove(1, 0, 3, 0)).toEqual(true);
	expect(chess.makeMove(7, 0, 5, 0)).toEqual(false);
	expect(chess.makeMove(6, 0, 4, 0)).toEqual(true);
	expect(chess.makeMove(0, 0, 2, 0)).toEqual(true);
	expect(chess.makeMove(7, 0, 5, 0)).toEqual(true);
	expect(chess.makeMove(2, 0, 2, 5)).toEqual(true);
	expect(chess.makeMove(5, 0, 5, 5)).toEqual(true);
	expect(chess.makeMove(2, 5, 5, 5)).toEqual(true);
	expect(chess.points[0]).toEqual(5);
});

test("KnightMove", () => {
	chess.initializeBoard();
	expect(chess.makeMove(0, 1, 0, 3)).toEqual(false);
	expect(chess.makeMove(0, 1, 2, 2)).toEqual(true);
	expect(chess.makeMove(7, 1, 5, 0)).toEqual(true);
	expect(chess.makeMove(2, 2, 4, 3)).toEqual(true);
	expect(chess.makeMove(5, 0, 3, 1)).toEqual(true);
	expect(chess.makeMove(4, 3, 3, 1)).toEqual(true);
	expect(chess.points[0]).toEqual(3);
});

test("BishopMove", () => {
	chess.initializeBoard();
	expect(chess.makeMove(0, 2, 2, 4)).toEqual(false);
	expect(chess.makeMove(1, 3, 2, 3)).toEqual(true);
	expect(chess.makeMove(6, 4, 5, 4)).toEqual(true);
	expect(chess.makeMove(0, 2, 2, 4)).toEqual(true);
	expect(chess.makeMove(7, 5, 4, 2)).toEqual(true);
	expect(chess.makeMove(2, 4, 4, 2)).toEqual(true);
	expect(chess.points[0]).toEqual(3);
});

test("QueenMove", () => {
	chess.initializeBoard();
	expect(chess.makeMove(0, 3, 4, 3)).toEqual(false);
	expect(chess.makeMove(1, 4, 3, 4)).toEqual(true);
	expect(chess.makeMove(6, 3, 4, 3)).toEqual(true);
	expect(chess.makeMove(0, 3, 4, 7)).toEqual(true);
	expect(chess.makeMove(7, 3, 2, 3)).toEqual(false);
	expect(chess.makeMove(7, 3, 5, 3)).toEqual(true);
	expect(chess.makeMove(4, 7, 5, 7)).toEqual(true);
	expect(chess.makeMove(5, 3, 5, 7)).toEqual(true);
	expect(chess.points[1]).toEqual(9);
});

test("KingMove", () => {
	chess.initializeBoard();
	expect(chess.makeMove(0, 4, 1, 4)).toEqual(false);
	expect(chess.makeMove(1, 4, 3, 4)).toEqual(true);
	expect(chess.makeMove(6, 4, 4, 4)).toEqual(true);
	expect(chess.makeMove(0, 4, 1, 4)).toEqual(true);
	expect(chess.makeMove(7, 4, 6, 4)).toEqual(true);
	expect(chess.makeMove(1, 4, 2, 5)).toEqual(true);
	expect(chess.makeMove(6, 4, 5, 5)).toEqual(true);
	expect(chess.makeMove(2, 5, 3, 5)).toEqual(false);
});

test("Check",() => {
	chess.initializeBoard();
	expect(chess.makeMove(1, 5, 2, 5)).toEqual(true);
	expect(chess.makeMove(6, 4, 5, 4)).toEqual(true);
	expect(chess.makeMove(1, 6, 2, 6)).toEqual(true);
	expect(chess.makeMove(7, 3, 3, 7)).toEqual(true);
	expect(chess.makeMove(2, 6, 3, 6)).toEqual(false);
	expect(chess.makeMove(1, 0, 2, 0)).toEqual(true);
	expect(chess.makeMove(3, 7, 2, 6)).toEqual(true);
	expect(chess.isKingChecked(0)).toEqual(true);
	expect(chess.isCheckmated(0)).toEqual(false);
});

test("CheckMate",() => {
	chess.initializeBoard();
	expect(chess.makeMove(1, 5, 2, 5)).toEqual(true);
	expect(chess.makeMove(6, 4, 5, 4)).toEqual(true);
	expect(chess.makeMove(1, 6, 3, 6)).toEqual(true);
	expect(chess.makeMove(7, 3, 3, 7)).toEqual(true);
	expect(chess.isCheckmated(0)).toEqual(true);
});

test("Stalemate",() => {
	chess.initializeBoard();
	for (let i = 0; i < chess.board.length; i++){
		for (let j = 0; j < chess.board[i].length; j++){
			chess.board[i][j] = null;
		}
	}
	chess.board[0][3] = new Piece(1, 1);
	chess.board[0][5] = new Piece(1, 1);
	chess.board[3][0] = new Piece(1, 1);
	chess.board[5][0] = new Piece(1, 1);
	chess.board[4][4] = new Piece(0, 5);
	expect(chess.isStalemated(0)).toEqual(true);
	expect(chess.isCheckmated(0)).toEqual(false);
});

test("Stalemate",() => {
	chess.initializeBoard();
	for (let i = 0; i < chess.board.length; i++){
		for (let j = 0; j < chess.board[i].length; j++){
			if (!chess.board[i][j]){
				continue;
			}
			if (chess.board[i][j].type != 1 && chess.board[i][j].type != 5){
				chess.board[i][j] = null;
			}
		}
	}
	expect(chess.canCastle(0, 0)).toEqual(true);
	expect(chess.canCastle(0, 1)).toEqual(true);
	expect(chess.canCastle(1, 0)).toEqual(true);
	expect(chess.canCastle(1, 1)).toEqual(true);
	expect(chess.makeMove(0, 0, 0, 3)).toEqual(true);
	expect(chess.canCastle(0, 0)).toEqual(false);
	expect(chess.canCastle(1, 0)).toEqual(false);
	expect(chess.makeMove(7, 4, 7, 0)).toEqual(false);
	expect(chess.makeMove(7, 4, 7, 7)).toEqual(true);
});



