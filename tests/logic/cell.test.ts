import { Cell, CellType } from '../../src/logic/cell';

describe('testing Cell class', () => {
  test('Can construct Cell', () => {
    let cell = new Cell(1,2,CellType.BOMB)
    expect(cell.x).toBe(1);
    expect(cell.y).toBe(2);
    expect(cell.cellType).toBe(CellType.BOMB);
  });

  test('Cell type enum', () => {
    expect(CellType.FOUR).toBe(4);
  });

  test('Equality Sanity check', () => {
    expect(new Cell(1, 2, CellType.FIVE)).toStrictEqual(new Cell(1, 2, CellType.FIVE));
  });
});