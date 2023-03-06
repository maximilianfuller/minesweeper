import express, {Request,Response,Application} from 'express';
import { WebSocketServer } from 'ws';

const app:Application = express();
app.use(express.static('dist'));
app.use(express.static('src'));
const wss = new WebSocketServer({ port: 8080 });

let games = new Map<string, any>()

function createBoard() {
  let NUM_ROWS = 9
  let NUM_COLS = 9
  let MAX_BOMBS = 10
  let bombs : Array<number> = [];
  for (let i = 0; i < MAX_BOMBS; i++) {
    let bomb = -1;
    do {
      bomb = Math.floor(Math.random() * NUM_COLS * NUM_ROWS);
    } while (bombs.includes(bomb));
    bombs.push(bomb);
  }

  return {"bombs": bombs, "numRows": NUM_ROWS, "numCols": NUM_COLS};
}

function handleClientCreate(ws: any, url: string) {
  if(!games.get(url)) {
    games.set(url, {});
  }
  let game = games.get(url)!;
  if (!game.p1) {
    ws.id = 'p1';
    game.p1 = {"ws": ws, "clickedCells": []};
    console.log('p1 has started a game at ' + url);
  } else if (!game.p2) {
    ws.id = 'p2';
    game.p2 = {"ws": ws, "clickedCells": []};
    console.log('p2 has joined the game at ' + url);
    game.board = createBoard();
    updateClients(url);
  }
}

function handleClientUpdate(ws: any, url: string, data: any) {
  let game = games.get(url)!;
  game[ws.id].clickedCells = JSON.parse(data);
  let winner = maybeGetWinner(url);
  if (winner) {
    console.log("winner!" + winner);
    game.winner = winner;
  }
  updateClients(url);
}

function maybeGetWinner(url: string) {
  let game = games.get(url)!;
  let allCells = new Set([...Array(game.board.numRows*game.board.numCols).keys()]);
  let bombCells = new Set([...game.board.bombs]);
  let nonBombCells = new Set([...allCells].filter(x => !bombCells.has(x)));
  let players = ["p1", "p2"];
  for(let i = 0; i < 2; i++) {
    let player = players[i];
    let other = players[(i+1)%2];
    let clickedCells = new Set([...game[player].clickedCells]);
    let unClickedNonBombCells = [...nonBombCells].filter(x => !clickedCells.has(x));
    if (unClickedNonBombCells.length == 0) {
      // All the cells cleared, you win!
      return player;
    }
    let clickedBombCells = [...bombCells].filter(x => clickedCells.has(x));
    if (clickedBombCells.length > 0) {
      // A bomb was clicked, you lose.
      return other;
    }
  }
  return null;
}

function updateClients(url: string) {
  let game = games.get(url)!;
  let p1Data = {...game.board};
  p1Data.enemyClickedCells = game.p2.clickedCells;
  if (game.winner) {
    p1Data.gameOverMessage = game.winner == "p1" ? "YOU WIN!" : "you lose";
  }
  game.p1.ws.send(JSON.stringify(p1Data));

  let p2Data = {...game.board};
  p2Data.enemyClickedCells = game.p1.clickedCells;
  if (game.winner) {
    p2Data.gameOverMessage = game.winner == "p2" ? "YOU WIN!" : "you lose";
  }
  game.p2.ws.send(JSON.stringify(p2Data));
}

// Setup websocket
wss.on('connection', function connection(ws: any, req: any) {
  handleClientCreate(ws, req.url);
  ws.on('message', function message(data: any) {
    handleClientUpdate(ws, req.url, data)
  });
  ws.on('error', console.error);

});

// Setup express server
app.get("/game/:id", (req:Request, res:Response):void => {
  res.sendFile("index.html", {root: __dirname })
});

app.listen(8000, ():void => {
  console.log(`Server Running here 👉 http://localhost:${8000}`);
});






