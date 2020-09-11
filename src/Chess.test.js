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
});

