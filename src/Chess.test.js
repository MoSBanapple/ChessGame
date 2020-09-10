import {Piece, ChessGame} from './Chess.js';

let chess = new ChessGame();

test("test", () => {
	chess.initializeBoard();
	expect(chess.currentTurn).toEqual(0);
});