import {Request,Response,Application} from 'express';
import mustacheExpress from 'mustache-express';
import mustache from 'mustache-express';
var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session')

import { Server } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { HumanPlayer } from './logic/game/human_player';
import { Referee } from './logic/game/referee';
import { Board } from './logic/game/board';
import { HumanSpectator } from './logic/game/human_spectator';
import { SearchBot } from './logic/game/bot_players/search_bot';
import { BotUser } from './logic/matchmake/bot_user';
import { User } from './logic/matchmake/user';
import { HumanUser } from './logic/matchmake/human_user';

// [NUM_ROWS, NUM_COLS, NUM_BOMBS]
let CONFIG : any = {
  "beginner": [9,9,10],
  "intermediate": [16,16,40],
  "advanced": [30, 16, 99]
}

// const NUM_BOTS = 20;
const NUM_BOTS = 20;

const MIN_SPEED_MILLIS = 200;
const MAX_SPEED_MILLIS = 2200;



const app:Application = express();

// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'keyboard dog',
  // resave: false,
  // saveUninitialized: true,
  // cookie: { secure: true }
  genid: function() {
    return uuidv4() // use UUIDs for session IDs
  },
  cookie: {}
}))

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



// ongoing games
let games = new Map<string, any>()

// matchmaking queue
let waitingForGame: User[] = [];

//connections to reroute clients once matches are made
let matchmakeSockets = new Map<string, any>();

let users = new Map<string, User>()

let botUsers = []
for(let i = 0; i < NUM_BOTS; i++) {
  const speed = i/NUM_BOTS * (MAX_SPEED_MILLIS- MIN_SPEED_MILLIS) + MIN_SPEED_MILLIS;
  let bot = new BotUser(speed + "Bot", speed);
  botUsers.push(bot);
  waitingForGame.push(bot);
}



app.post("/quickmatch", (req:any, res:Response):void => {
  var user = users.get(req.sessionID);
  console.log(user)
  if (!user) {
    console.log("creating new user")
    user = new HumanUser(req.sessionID, "STEPHE")
    users.set(req.sessionID, user)
  }
  waitingForGame.push(user)
  res.send("quickmatch started")
});

app.get("/watch/:id", (req:Request, res:Response):void => {
  res.sendFile("spectate.html", {root: __dirname })
});

app.post("/create", (req:any, res:any):void => {
  let config = CONFIG[req.body.config];
  let game = {"board": createBoard(config), "config": config};
  let url = "/game/" + uuidv4();
  games.set(url, game);
  res.send(url);
});

// MATCHMAKING LOOP
function matchMake() {
  console.log("matchMake: " + waitingForGame.length + " in queue")
  waitingForGame.sort((a,b)=> b.getRating() - a.getRating())
  let numWaiting = waitingForGame.length
  for(let i = 1; i < numWaiting; i+=2) {
    let board = createBoard(CONFIG.beginner);
    let u1 = waitingForGame.pop()!;
    let u2 = waitingForGame.pop()!;

    let u1Title= u1.getName() + "(" + Math.round(u1.getRating()) + ")";
    let u2Title = u2.getName() + "(" + Math.round(u2.getRating()) + ")";
    let url = "/game/" + u1Title + "_vs_" + u2Title;

    let p1 = u1.makePlayer();
    let p2 = u2.makePlayer();

    if(matchmakeSockets.has(p1.getId())) {
      let ws = matchmakeSockets.get(p1.getId());
      ws.send(url);
      matchmakeSockets.delete(p1.getId())
    }
    if(matchmakeSockets.has(p2.getId())) {
      let ws = matchmakeSockets.get(p2.getId());
      ws.send(url);
      matchmakeSockets.delete(p2.getId())
    }
    
    games.set(url, {});
    games.get(url)!.board = board;
    games.get(url)!.p1 = p1;
    games.get(url)!.p2 = p2;
    games.get(url)!.referee = new Referee(board, [p1, p2], () => {
      let p1Winner = games.get(url)!.referee.winner() == 0;
      u1.handleResult(u2, p1Winner);
      u2.handleResult(u1, !p1Winner);
      if(u1.autoQueue()) {
        waitingForGame.push(u1);
      }
      if(u2.autoQueue()) {
        waitingForGame.push(u2);
      }
      games.delete(url);
    });

  }
}

function repeatedlyMatchMake() {
  matchMake();
  setTimeout(() => { repeatedlyMatchMake() } , 5000);
}

repeatedlyMatchMake();


app.get("", (req:Request, res:Response):void => {
  let ongoingGameIDs = Array.from(games.keys()).filter(x => games.get(x).p1 && games.get(x).p2);
  let gamesList = ongoingGameIDs.sort( (a, b) => {
    // sort by rating
    let aGame = games.get(a);
    let bGame = games.get(b);
    let aRating = Math.max(aGame.p1.getRating(), aGame.p2.getRating());
    let bRating = Math.max(bGame.p1.getRating(), bGame.p2.getRating());
    return bRating-aRating;
  }).map(key =>  { return {gameId: key};});
  res.render("index.mst", {games: gamesList})
});

const server = app.listen(PORT, ():void => {
  console.log(`Server Running here 👉 http://localhost:${PORT}`);
});

const wss = new Server({server});

function createBoard(config: any) {
  let numCols = config[0];
  let numRows = config[1];
  let numBombs = config[2];
  while(true) {
    let b = new Board(numCols, numRows, numBombs);
    let p = new SearchBot(true, () => 0);
    let r = new Referee(b, [p])
    if (r.gameOver()) {
      // game is solved
      return b;
    }
  }
}

function handleClientCreate(ws: any, url: string, sessionID: string) {  
  if(!games.get(url)) {
    games.set(url, {});
  }
  let game = games.get(url)!;
  if (!game.p1) {
    ws.id = 'p1';
    game.p1 = new HumanPlayer(sessionID, ws);
    console.log('p1 has started a game at ' + url);
  } else if (!game.p2) {
    ws.id = 'p2';
    game.p2 = new HumanPlayer(sessionID, ws);
    console.log('p2 has joined the game at ' + url);
    if (!game.board) {
      let config = CONFIG.beginner;
      game.board = createBoard(config);
    }
    game.referee = new Referee(game.board, [game.p1, game.p2]);
  } else {
    // check for players coming from matchmaking

    if (game.p1.getId() == sessionID) {
      ws.id = 'p1'
      game.p1.setWebSocket(ws);
      return;
    } else if (game.p2.getId() == sessionID) {
      ws.id = 'p2'
      game.p2.setWebSocket(ws);
      return;
    }


    // spectator
    console.log("SPECTATOR")
    let s = new HumanSpectator(ws);
    game.referee.addSpectator(s);
  }
}

function handleClientUpdate(ws: any, url: string, data: any) {
  // spectators don't produce updates
  if(!ws.id) {return;}

  let game = games.get(url)!;
  let coord = JSON.parse(data);
  game[ws.id].select(coord[0], coord[1]);
  if (game.referee.gameOver()) {
    // Scrub game from server
    console.log("game " + url + " deleted.")
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
  let i = req.rawHeaders.indexOf("Cookie")
  let sessionID = req.rawHeaders[i+1].substring(16, 52);
  if (req.url.startsWith("/matchmake")) {
    matchmakeSockets.set(sessionID, ws);
    return;
  }


  handleClientCreate(ws, req.url, sessionID);
  ws.on('message', function message(data: any) {
    handleClientUpdate(ws, req.url, data)
  });
  ws.on('error', console.error);
  ws.on('close', function close() {
    handleClientDisconnect(ws, req.url);
  });

});