TILE_PIXEL_LENGTH = 16;
let NEIGHBOR_RELATIVE_COORDS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];

let url = document.URL.replace('http', 'ws');

let gameOn = false;

const webSocket = new WebSocket(url);
webSocket.onmessage = (event) => {
  let board = JSON.parse(event.data);
  if (!gameOn) {
    gameOn = true;
    setupBoard(board);
  }
  updateProgressBars(board);
  if (board.gameOverMessage) {
    if(!alert(board.gameOverMessage)) {
      console.log("reload");
      window.location.reload();
    }
  }
};

function updateServer(board) {
  let clickedCells = getClickedCells(board);
  webSocket.send(JSON.stringify(clickedCells));
}

function getClickedCells(board) {
  let clickedCoords = [];
  for (let i = 0; i < board.numRows; i++) {
    for (let j = 0; j < board.numCols; j++) {
      if (isRevealed(j, i, board)) {
        clickedCoords.push(j + i*board.numCols);
      }
    }
  }
  return clickedCoords;
}

function getNeighborCoords(x, y, board) {
  let out = []
  for (let i = 0; i < NEIGHBOR_RELATIVE_COORDS.length; i++) {
    let c = NEIGHBOR_RELATIVE_COORDS[i][0]
    let r = NEIGHBOR_RELATIVE_COORDS[i][1]
    if (x == 0 && c == -1) continue;
    if (x == board.numCols - 1 && c == 1) continue;
    if (y == 0 && r == -1) continue;
    if (y == board.numRows - 1 && r == 1) continue;
    out.push([x + c, y + r])
  }
  return out
}

function getBombNeighborCount(x, y, board) {
  let count = 0
  let coords = getNeighborCoords(x, y, board);
  for (let i = 0; i < coords.length; i++) {
    let c = coords[i]
    if (board.bombs.includes(c[0] + board.numCols*c[1])) {
      count++;
    }
  }
  return count;
}

function isBomb(x, y, board) {  
  return board.bombs.includes(x + (board.numCols * y));
}

function reveal(x, y, board) {
  let id = x + board.numCols * y;
  $("#" + id).addClass("revealed");

}

function isRevealed(x, y, board) {
  let id = x + board.numCols * y;
  return $("#" + id).hasClass("revealed");
}

function revealDFS(x, y, board) {
  if (isRevealed(x, y, board)) {
    return;
  }
  reveal(x, y, board);

  if (getBombNeighborCount(x, y, board) > 0 || isBomb(x, y, board)) {
    return;
  }

  let coords = getNeighborCoords(x, y, board);
  for(let i = 0; i < coords.length; i++) {
    revealDFS(coords[i][0], coords[i][1], board)
  }
}

function setupBoard(board) {
  for (let y = 0; y < board.numRows; y++) {
    for (let x = 0; x < board.numCols; x++) {
      let cell = $('<div>', {
        id: board.numCols * y + x,
        class: 'cell',
      });
      cell.css("left", TILE_PIXEL_LENGTH * x);
      cell.css("top", TILE_PIXEL_LENGTH * y);
      if (isBomb(x, y, board)) {
        cell.addClass("bomb");
      } else {
        cell.addClass("c" + getBombNeighborCount(x, y, board))
      }
      cell.click(function() {
        let id = parseInt($(this).attr("id"))
        revealDFS(id % board.numCols, Math.floor(id / board.numCols), board);
        updateServer(board);
      })
      $('.border').append(cell);
    }
  }
  $("#" + board.start).addClass("start");
}

function updateProgressBars(board) {
  let safeCellCount = board.numRows*board.numCols - board.bombs.length;
  let enemyClickedBombsCount = 0;
  board.enemyClickedCells.forEach(function(i){
    if(board.bombs.includes(i)) {
      enemyClickedBombsCount++;
      $("#" + i).addClass("enemyClicked");
    }
  });
  let enemyProgress = (board.enemyClickedCells.length - enemyClickedBombsCount)/safeCellCount;
  $(".progress_bar.enemy").css("width", 100*enemyProgress + "%");

  let youClickedSafeCellCount = 0;
  for (let i = 0; i < board.numRows*board.numCols; i++) {
    if(board.bombs.includes(i)) {
      continue;
    }
    if ($("#" + i).hasClass("revealed")) {
      youClickedSafeCellCount++;
    }
  }
  let youProgress = youClickedSafeCellCount/safeCellCount;
  $(".progress_bar.you").css("width", 100*youProgress + "%");

}

$(document).ready(function() {});