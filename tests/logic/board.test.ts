import { Board } from '../../src/logic/board';
import { Cell, CellType } from '../../src/logic/cell';


describe('testing Board class', () => {
  test('Create Board', () => {
    let board = new Board(10, 11, 12);
    expect(board.numCols).toBe(10);
    expect(board.numRows).toBe(11);
    expect(board.bombs.size).toBe(12);
  });

  test('Get value in board', () => {
    let board = new Board(10, 11, 0);
    let cell = board.get(0,0);
    expect(cell.x).toBe(0);
    expect(cell.y).toBe(0);
    expect(cell.cellType).toBe(0);
    expect(board.isBomb(0,0)).toBe(false);
  });

  test('Get out of bounds value in board', () => {
    let board = new Board(10, 11, 0);
    board.get(0,0);
    board.get(9, 10);
    expect( () => board.get(-1, 0) ).toThrow(new Error('(-1, 0) out of bounds for grid of size (10, 11).'));
    expect( () => board.get(0, -1) ).toThrow(new Error('(0, -1) out of bounds for grid of size (10, 11).'));
    expect( () => board.get(10, 10) ).toThrow(new Error('(10, 10) out of bounds for grid of size (10, 11).'));
    expect( () => board.get(9, 11) ).toThrow(new Error('(9, 11) out of bounds for grid of size (10, 11).'));

  });

  test('Check bad numBombs', () => {
    expect( () => new Board(10, 11, 111) ).toThrow(new Error('111 requested but grid is size 10 by 11'));
  });

  test('Manually Create Board', () => {
    let b = new Board(3, 3, 1, new Set([0]));
    expect(b.get(0, 0)).toStrictEqual(new Cell(0, 0, CellType.BOMB));
    expect(b.get(0, 1)).toStrictEqual(new Cell(0, 1, CellType.ONE));
    expect(b.get(1, 0)).toStrictEqual(new Cell(1, 0, CellType.ONE));
    expect(b.get(2, 2)).toStrictEqual(new Cell(2, 2, CellType.ZERO));
  });
});