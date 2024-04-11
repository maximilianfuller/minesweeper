import { Referee } from '../../../src/logic/referee';
import { Board } from '../../../src/logic/board';
import { SearchBot } from '../../../src/logic/bot_players/search_bot';
import { FlagBot } from '../../../src/logic/bot_players/flag_bot';




describe('testing SearchBot class', () => {

  test('find freebies', () => {
    let b = new Board(2, 3, 1, new Set([3]));
    let p = new SearchBot(false);
    new Referee(b, [p]);
    p.select(0, 0);
    p.select(0, 1);
    p.select(1, 0);
    // [1, 1]
    // [1, B]
    // [F, F]
    // Given the ones uncovered, bot should mark B and click on the Fs.
    expect(p.gameOver()).toBe(false);
    p.tryMakeMove();
    p.tryMakeMove();
    p.tryMakeMove();
    
    expect(p.gameOver() && p.winner()).toBe(true);
  });

  test('not solvable', () => {
    let b = new Board(2, 2, 1, new Set([3]));
    let p = new SearchBot(false);
    new Referee(b, [p]);
    p.select(0, 0);
    p.select(0, 1);
    // [1, F]
    // [1, B]
    // Given the ones uncovered, there is no way to solve
    // the rest of the puzzle without guessing. The bot is stuck.
    expect(p.gameOver()).toBe(false);
    expect(p.tryMakeMove()).toBe(false);
    expect(p.tryMakeMove()).toBe(false);  
    expect(p.gameOver()).toBe(false);
  });

  test('1-1-1', () => {
    let b = new Board(2, 3, 1, new Set([3]));
    let p = new SearchBot(false);
    new Referee(b, [p]);
    p.select(0, 0);
    p.select(0, 1);
    p.select(0, 2);
    // [1, F]
    // [1, B]
    // [1, F]
    // Given the ones uncovered, bot should mark B and click on the Fs.
    expect(p.gameOver()).toBe(false);
    p.tryMakeMove();
    p.tryMakeMove();
    p.tryMakeMove();
  
    expect(p.gameOver() && p.winner()).toBe(true);
  });

  test('1-2-2-1', () => {
    let b = new Board(2, 4, 2, new Set([3, 5]));
    let p = new SearchBot(false);
    new Referee(b, [p]);
    p.select(0, 0);
    p.select(0, 1);
    p.select(0, 2);
    p.select(0, 3);
    // [1, F]
    // [2, B]
    // [2, B]
    // [1, F]
    // Given the ones uncovered, bot should mark B and click on the Fs.
    expect(p.gameOver()).toBe(false);
    p.tryMakeMove();
    p.tryMakeMove();
    p.tryMakeMove();
    p.tryMakeMove();
  
    expect(p.gameOver() && p.winner()).toBe(true);
  });


  test('speed test', () => {
    const runCount = 10;
    const start = new Date().getTime();
    let moveCount = 0;
    let winCount = 0;
    for(let i = 0; i < runCount; i++) {
      let board = new Board(30, 16, 99);
      let p = new SearchBot(false)
      let r = new Referee(board, [p], () => {});
      p.select(p.startInfo!.startX, p.startInfo!.startY);

      while(p.tryMakeMove()) {
        moveCount++;
      }
      if (p.winner()) {
        winCount++;
      }
    }
    let elapsed = new Date().getTime() - start;
    console.log("Made " + moveCount + " moves in " + elapsed);
    console.log("Solved " + winCount + " boards in " + runCount);




  });


});
