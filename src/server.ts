import express, {Request,Response,Application} from 'express';
var bodyParser = require('body-parser')
import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { HumanPlayer } from './logic/human_player';
import { Referee } from './logic/referee';
import { Board } from './logic/board';

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
  return new Board(numCols, numRows, numBombs);
}

function handleClientCreate(ws: any, url: string) {
  if(!games.get(url)) {
    games.set(url, {});
  }
  let game = games.get(url)!;
  if (!game.p1) {
    ws.id = 'p1';
    game.p1 = new HumanPlayer(ws);
    console.log('p1 has started a game at ' + url);
  } else if (!game.p2) {
    ws.id = 'p2';
    game.p2 = new HumanPlayer(ws);
    console.log('p2 has joined the game at ' + url);
    if (!game.board) {
      let config = CONFIG.beginner
      game.board = createBoard(config);
    }
    game.referee = new Referee(game.board, [game.p1, game.p2]);
  }
}

function handleClientUpdate(ws: any, url: string, data: any) {
  let game = games.get(url)!;
  let coord = JSON.parse(data);
  game[ws.id].select(coord[0], coord[1]);
  if (game.referee.gameOver()) {
    // Scrub game from server
    games.delete(url);
  }
}

function handleClientDisconnect(ws: any, url: string) {
  console.log("handleClientDisconnect " + ws.id);
  if (games.has(url)) {
    let game = games.get(url)!
    if (!game.referee) {
      // Game hasn't started
      return;
    }
    if (ws.id == "p1") {
      game.p2.notifyWin();
    } else {
      game.p1.notifyWin();
    }
    games.delete(url);
  }
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






