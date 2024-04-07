import express, {Request,Response,Application} from 'express';
import mustacheExpress from 'mustache-express';
import mustache from 'mustache-express';
// import mustache from 'mustache'
var bodyParser = require('body-parser')
import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { HumanPlayer } from './logic/human_player';
import { Referee } from './logic/referee';
import { Board } from './logic/board';
import { HumanSpectator } from './logic/human_spectator';
import { RandomBot } from './logic/bot_players/random_bot';
import { SimpleSearchBot } from './logic/bot_players/simple_search_bot';
import { FlagBot } from './logic/bot_players/flag_bot';



// [NUM_ROWS, NUM_COLS, NUM_BOMBS]
let CONFIG : any = {
  "beginner": [9,9,10],
  "intermediate": [16,16,40],
  "advanced": [30, 16, 99]
}

const app:Application = express();
app.use(express.static('dist'));
app.use(express.static('src'));
app.engine('mustache', mustacheExpress());


app.set('views', `${__dirname}/views`);
app.set('view engine', 'mustache');
app.engine('mst', mustache('./views', '.mst'));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const PORT = process.env.PORT || 8000;

// Setup express server
app.get("/game/:id", (req:Request, res:Response):void => {
  res.sendFile("minesweeper.html", {root: __dirname })
});

app.get("/watch/:id", (req:Request, res:Response):void => {
  res.sendFile("spectate.html", {root: __dirname })
});

app.post("/create", (req:any, res:any):void => {
  console.log(req.body.config);
  let config = CONFIG[req.body.config];
  let game = {"board": createBoard(config), "config": config};
  let url = "/game/" + uuidv4();
  games.set(url, game);
  res.send(url);
});

let games = new Map<string, any>()
var botCount = 0
function addBot() {
  let  url = "/game/bot_" + botCount++
  games.set(url, {});
  let board = createBoard(CONFIG["intermediate"]);
  let p1 = new FlagBot();
  let p2 = new SimpleSearchBot();
  games.get(url)!.board = board;
  games.get(url)!.p1 = p1;
  games.get(url)!.p2 = p2;
  games.get(url)!.referee = new Referee(board, [p1, p2], () => {games.delete(url)});
}

function repeatedlyAddBot() {
  addBot();
  setTimeout(() => { repeatedlyAddBot() } , 1000);
}

repeatedlyAddBot();
// addBot();

app.get("", (req:Request, res:Response):void => {
  let gamesToSend = Array.from(games.keys()).map(key =>  { return {gameId: key};});
  res.render("index.mst", {games: gamesToSend})
});

const server = app.listen(PORT, ():void => {
  console.log(`Server Running here 👉 http://localhost:${PORT}`);
});

const wss = new Server({server});

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
      let config = CONFIG.beginner;
      game.board = createBoard(config);
    }
    game.referee = new Referee(game.board, [game.p1, game.p2]);
  } else {
    // spectator
    let s = new HumanSpectator(ws);
    game.referee.addSpectator(s);
  }
}

function handleClientUpdate(ws: any, url: string, data: any) {
  let game = games.get(url)!;
  let coord = JSON.parse(data);
  if (!game.has(ws.id)) return;
  game[ws.id].select(coord[0], coord[1]);
  if (game.referee.gameOver()) {
    // Scrub game from server
    games.delete(url);
  }
}

function handleClientDisconnect(ws: any, url: string) {
  if (games.has(url)) {
    let game = games.get(url)!
    if (!game.referee) {
      // Game hasn't started
      return;
    }
    if (ws.id == "p1") {
      game.p2.notifyWin();
      games.delete(url);
    } else if (ws.id == "p2") {
      game.p1.notifyWin();
      games.delete(url);
    }
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






