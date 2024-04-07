import { Referee } from '../../../src/logic/referee';
import { Board } from '../../../src/logic/board';
import { Cell, CellType } from '../../../src/logic/cell';
import { StartInfo } from '../../../src/logic/player';
import { SearchBot } from '../../../src/logic/bot_players/search_bot';
import { BaseSpectator } from '../../../src/logic/spectator';



describe('testing SearchBot class', () => {

  test('find freebie bomb', () => {
    let b = new Board(1, 2, 1, new Set([0]));
    let callCount = 0
    let p = new class extends BasePlayer {
      notifyGameUpdate(newCells: Array<Cell>): void {
        callCount++;
        let expectedCells = [
          new Cell(0,1,1),
          new Cell(1,0,1),
          new Cell(1,1,1),
          new Cell(0,2,0),
          new Cell(1,2,0),
          new Cell(2,2,0),
          new Cell(2,1,0),
          new Cell(2,0,0)
        ];
        let actual = newCells.map(c => JSON.stringify(c)).sort();
        let expected = expectedCells.map(c => JSON.stringify(c)).sort();
        expect(actual).toStrictEqual(expected);
      }
    }();
    let r = new Referee(b, [p]);
    p.select(2, 2);
    expect(callCount).toBe(1);
  });
});
