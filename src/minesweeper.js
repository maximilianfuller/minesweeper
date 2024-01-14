let url = document.URL.replace('http', 'ws');
let gameOn = false;

const webSocket = new WebSocket(url);
webSocket.onmessage = (event) => {
  let board = JSON.parse(event.data);
  console.log(board);
  if (!gameOn) {
    gameOn = true;
    setupBoard(board);
  }
  updateProgressBars(board);
  board.newCells.forEach(function(c){
    let id = c.x + board.numCols * c.y;
    let cell = $("#" + id);
    cell.addClass("revealed");
    if (c.cellType == 9) {
      cell.addClass("bomb")
    } else {
      cell.addClass("c" + c.cellType)
    }
  });
  board.enemyNewCells.forEach(function(c) {
    let id = c.x + board.numCols * c.y;
    ("#" + id).addClass("enemyClicked");
  });

  if (board.gameOverMessage) {
    // Delay to let the UI update finish.
    setTimeout(function() {
      alert(board.gameOverMessage)
      // window.location.reload();
    }, 10)
    
  }
};

function setupBoard(board) {
  let isMouseDown = false
  for (let y = 0; y < board.numRows; y++) {
    for (let x = 0; x < board.numCols; x++) {
      let cell = $('<div>', {
        id: board.numCols * y + x,
        class: 'cell',
      });
      $('.border').append(cell);
      tilePixelLength = cell.css("width").substring(0, cell.css("width").length-2);
      cell.css("left", tilePixelLength * x);
      cell.css("top", tilePixelLength * y);
      cell.click(function() {
        let id = parseInt($(this).attr("id"));
        if ($("#" + id).hasClass('flag')) {
          return;
        }
        x = id % board.numCols;
        y = Math.floor(id / board.numCols);
        webSocket.send(JSON.stringify([x, y]));
      })
      cell.contextmenu(function() {
        if(cell.hasClass('flag')) {
          cell.addClass('question');
          cell.removeClass('flag');
        } else if (cell.hasClass('question')) {
          cell.removeClass('question');
        } else {
          cell.addClass('flag');
        }
        return false;
      });
      cell.on('mousedown', function() {
        isMouseDown = true;
        cell.addClass('pressed');
      });
      cell.on('mouseover', function(e) {
        if (isMouseDown) {
          cell.addClass('pressed');
        }
      });
      cell.on('mouseup', function() {
        isMouseDown = false;
        cell.removeClass('pressed');
      });
      cell.on('mouseleave', function() {
        cell.removeClass('pressed');
      });
      cell.on('dragstart', function() {
        return false;
      });
    }
  }
  $("#" + board.start).addClass("start");
}

function updateProgressBars(board) {
  $(".progress_bar.enemy").css("width", 100*board.enemyProgress/board.totalProgress + "%");
  $(".progress_bar.you").css("width", 100*board.progress/board.totalProgress + "%");
}

$(document).ready(function() {});