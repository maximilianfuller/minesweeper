import { Referee } from '../../src/logic/referee';
import { Board } from '../../src/logic/board';
import { Cell, CellType } from '../../src/logic/cell';
import { BasePlayer, StartInfo } from '../../src/logic/player';



describe('testing Referee class', () => {
  test('One player click on bomb', () => {
    let b = new Board(3, 3, 1, new Set([0]));
    let callCount = 0
    let p = new class extends BasePlayer {
      notifyGameUpdate(newCells: Array<Cell>): void {
        callCount++;
        expect(newCells).toStrictEqual([new Cell(0,0, CellType.BOMB)]);
      }
    }();
    let r = new Referee(b, [p]);
    p.select(0, 0);
    expect(callCount).toBe(1);
  });

  test('Verify Start Position', () => {
    let b = new Board(10, 10, 10);
    let callCount = 0
    let p = new class extends BasePlayer {
      notifyStart(startInfo: StartInfo): void {
        expect(startInfo.boardNumCols).toBe(10);
        expect(startInfo.boardNumRows).toBe(10);
        expect(startInfo.numBombs).toBe(10);
        expect(b.get(startInfo.startX, startInfo.startY).cellType).toBe(CellType.ZERO);
        callCount++;
      }
    }();
    let r = new Referee(b, [p]);
    expect(callCount).toBe(1);
  });

  test('One player click on expanding square', () => {
    let b = new Board(3, 3, 1, new Set([0]));
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

  test('Enemy notified on player click', () => {
    let b = new Board(3, 3, 1, new Set([0]));
    let callCount = 0
    let player = new BasePlayer()
    let enemyPlayer = new class extends BasePlayer {
      notifyEnemyGameUpdate(newCells: Array<Cell>): void {
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
    let r = new Referee(b, [player, enemyPlayer]);
    player.select(2, 2);
    expect(callCount).toBe(1);
  });

  test('Game over from bomb', () => {
    let b = new Board(3, 3, 1, new Set([0]));
    let lossCount = 0;
    let winCount = 0;
    let p1 = new class extends BasePlayer {
      notifyLoss(): void {
        lossCount++;
      }
    }();
    let p2 = new class extends BasePlayer {
      notifyWin(): void {
        winCount++;
      }
    }();
    let r = new Referee(b, [p1, p2]);
    expect(r.gameOver()).toBe(false);
    p1.select(0, 0);
    expect(lossCount).toBe(1);
    expect(winCount).toBe(1);
    expect(r.gameOver()).toBe(true);
  });

  test('Game over from finish', () => {
    let b = new Board(3, 3, 1, new Set([0]));
    let lossCount = 0;
    let winCount = 0;
    let p1 = new class extends BasePlayer {
      notifyLoss(): void {
        lossCount++;
      }
    }();
    let p2 = new class extends BasePlayer {
      notifyWin(): void {
        winCount++;
      }
    }();
    let r = new Referee(b, [p1, p2]);
    expect(r.gameOver()).toBe(false);
    p2.select(2, 2);
    expect(lossCount).toBe(1);
    expect(winCount).toBe(1);
    expect(r.gameOver()).toBe(true);
  });  
});