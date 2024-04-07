import { Referee } from '../../../src/logic/referee';
import { Board } from '../../../src/logic/board';
import { SearchBot } from '../../../src/logic/bot_players/search_bot';



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
    p.makeMove();
    p.makeMove();
    p.makeMove();
    
    expect(p.gameOver() && p.winner()).toBe(true);
  });


  // test('1-1-1', () => {
  //   let b = new Board(2, 3, 1, new Set([3]));
  //   let p = new SearchBot(false);
  //   new Referee(b, [p]);
  //   p.select(0, 0);
  //   p.select(0, 1);
  //   p.select(0, 2);
  //   // [1, F]
  //   // [1, B]
  //   // [1, F]
  //   // Given the ones uncovered, bot should mark B and click on the Fs.
  //   expect(p.gameOver()).toBe(false);
  //   p.makeMove();
  //   p.makeMove();
  //   p.makeMove();
  
  //   expect(p.gameOver() && p.winner()).toBe(true);
  // });
});
