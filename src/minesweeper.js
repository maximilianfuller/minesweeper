let gameOn = false;

let url = document.URL.replace('http', 'ws');
const webSocket = new WebSocket(url);
webSocket.onmessage = (event) => {
  let boards = JSON.parse(event.data);
  let board = boards[0]
  if (!gameOn) {
    gameOn = true;
    if (!board.spectator) {
      setupBoard(board, $('.board'));
      $('.board0').hide()
      $('.board1').hide()
    } else {
      setupBoard(boards[0], $('.board0'))
      setupBoard(boards[1], $('.board1'))
      $('.board').hide()
      $('.progress_bar_container').hide()
    }
  }
  if (!board.spectator) {
    updateProgressBars(board);
    board.newCells.forEach(function(c){
      let id = c.x + board.numCols * c.y;
      let cell = $("." + id);
      cell.addClass("revealed");
      if (c.cellType == 9) {
        cell.addClass("bomb")
      } else {
        cell.addClass("c" + c.cellType)
      }
    });
    board.enemyNewCells.forEach(function(c) {
      let id = c.x + board.numCols * c.y;
      $("." + id).addClass("enemyClicked");
    });

    if (board.gameOverMessage) {
      // Delay to let the UI update finish.
      setTimeout(function() {
        alert(board.gameOverMessage)
        // window.location.reload();
      }, 10) 
    }
  } else {
    boards[0].newCells.forEach(function(c){
      let id = c.x + board.numCols * c.y;
      let cell = $(".board0 ." + id);
      cell.addClass("revealed");
      if (c.cellType == 9) {
        cell.addClass("bomb")
      } else if (c.cellType == 11) {
        cell.addClass("flag")
      } else {
        cell.addClass("c" + c.cellType)
      }
    });
    boards[1].newCells.forEach(function(c){
      let id = c.x + board.numCols * c.y;
      let cell = $(".board1 ." + id);
      cell.addClass("revealed");
      if (c.cellType == 9) {
        cell.addClass("bomb")
      } else if (c.cellType == 11) {
        cell.addClass("flag")
      } else {
        cell.addClass("c" + c.cellType)
      }
    });
  }
};

function setupBoard(board, parentDiv) {
  parentDiv.text(board.playerName + '\n' + board.playerRating);
  let cells = $('<div>').addClass('cells')
  parentDiv.append(cells);
  let isMouseDown = false
  for (let y = 0; y < board.numRows; y++) {
    for (let x = 0; x < board.numCols; x++) {
      let id = board.numCols * y + x;
      let cell = $('<div>', {
        class: id + ' cell',
      });
      if (id == board.start) {
        cell.addClass("start")
      }
      cells.append(cell);
      tilePixelLength = cell.css("width").substring(0, cell.css("width").length-2);
      cell.css("left", tilePixelLength * x);
      cell.css("top", tilePixelLength * y);
      cell.click(function() {
        let id = parseInt($(this).attr("class").split(" ")[0]);
        if ($("." + id).hasClass('flag')) {
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
}

function updateProgressBars(board) {
  $(".progress_bar.enemy").css("width", 100*board.enemyProgress/board.totalProgress + "%");
  $(".progress_bar.you").css("width", 100*board.progress/board.totalProgress + "%");
}

$(document).ready(function() {});