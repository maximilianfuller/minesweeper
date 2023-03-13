import express, {Request,Response,Application} from 'express';
var bodyParser = require('body-parser')
import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';

let NEIGHBOR_RELATIVE_COORDS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 0] 
];

// [NUM_ROWS, NUM_COLS, NUM_BOMBS]
let CONFIG : any = {
  "beginner": [9,9,10],
  "intermediate": [16,16,40],
  "advanced": [30, 16, 100]
}

const app:Application = express();
app.use(express.static('dist'));
app.use(express.static('src'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
const PORT = process.env.PORT || 8000;

var jsonParser = bodyParser.json()

// Setup express server
app.get("/game/:id", (req:Request, res:Response):void => {
  res.sendFile("minesweeper.html", {root: __dirname })
});

app.post("/create", (req:any, res:any):void => {
  console.log(req.body.config);
  let config = CONFIG[req.body.config];
  let game = {"board": createBoard(config), "config": config};
  let url = "/game/" + uuidv4();
  games.set(url, game);
  res.send(url);
});

app.get("", (req:Request, res:Response):void => {
  res.sendFile("index.html", {root: __dirname })
});

const server = app.listen(PORT, ():void => {
  console.log(`Server Running here 👉 http://localhost:${PORT}`);
});

const wss = new Server({server});

let games = new Map<string, any>()

function createBoard(config: any) {
  let numCols = config[0];
  let numRows = config[1];
  let numBombs = config[2];
  let bombs : Array<number> = [];
  // create bombs
  for (let i = 0; i < numBombs; i++) {
    let bomb = -1;
    do {
      bomb = Math.floor(Math.random() * numCols * numRows);
    } while (bombs.includes(bomb));
    bombs.push(bomb);
  }

  // Find a random empty square
  let zero_cells = []
  let bomb_set = new Set([...bombs])
  for (let i = 0; i < numRows*numCols; i++) {
    let has_bomb_neighbor = false;
    for (let c = 0; c < NEIGHBOR_RELATIVE_COORDS.length; c++) {
      let x = i%numCols + NEIGHBOR_RELATIVE_COORDS[c][0];
      let y = Math.floor(i/numCols) + NEIGHBOR_RELATIVE_COORDS[c][1];
      if (x < 0 || y < 0 || x >= numCols || y >= numRows) {
        continue;
      }
      if (bomb_set.has(x+y*numCols)) {
        has_bomb_neighbor = true;
        break;
      }
    }
    if (!has_bomb_neighbor) {
      zero_cells.push(i);
    }
  }
  let start = zero_cells[Math.floor(Math.random()*zero_cells.length)];

  return {"bombs": bombs, "start": start, "numRows": numRows, "numCols": numCols};
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
    if (!game.board) {
      let config = CONFIG.beginner
      game.board = createBoard(config);
    }
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
    updateClients(url);
    // Scrub game from server
    games.delete(url);
  } else {
    updateClients(url);
  }
}

function handleClientDisconnect(ws: any, url: string) {
  console.log("handleClientDisconnect " + ws.id);
  if (games.has(url)) {
    let game = games.get(url)!
    if (game.p2) {
      let players = ["p1", "p2"];
      for(let i = 0; i < 2; i++) {
        let player = players[i];
        let other = players[(i+1)%2];
        if (ws.id == player) {
          console.log("Player " + player + " left the game.")
          game.winner = other;
          updateClients(url);
          games.delete(url);
        }
      }
    }
  }
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
  ws.on('close', function close() {
    handleClientDisconnect(ws, req.url);
  });

});






