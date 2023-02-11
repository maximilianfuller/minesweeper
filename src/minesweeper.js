NUM_ROWS = 10
NUM_COLS = 10
MAX_BOMBS = 10
NEIGHBOR_COORDS = [[-1,-1],[-1,0],[-1,1],[0,-1],[0,1],[1,-1],[1,0],[1,1]];

BOMBS = [];
for (i=0; i<MAX_BOMBS; i++) {
  BOMBS.push(Math.floor(Math.random()*NUM_COLS*NUM_ROWS));
}

console.log(BOMBS);

function getBombNeighborCount(x, y) {
  count = 0
  for (i = 0; i < NEIGHBOR_COORDS.length; i++) {
    c = NEIGHBOR_COORDS[i][0]
    r = NEIGHBOR_COORDS[i][1]
    if (x == 0 && c == -1) continue;
    if (x == NUM_COLS-1 && c == 1) continue;
    if (y == 0 && r == -1) continue;
    if (y == NUM_ROWS-1 && r == 1) continue;
    if (BOMBS.includes(x+c + NUM_COLS*(y+r))) count++;
  }
  return count;
}

function isBomb(x, y) {
  return BOMBS.includes(x + NUM_COLS*y);
}

function reveal(x, y) {
  id = x+NUM_COLS*y
  $("#" + id).css("font-size", 20);
}

$(document).ready(function() {
  $("h1").click(function() {
    $(this).hide();
  });

  for (x = 0; x < NUM_COLS; x++) {
    for (y = 0; y < NUM_ROWS; y++) {
      cell = $('<div>', {
        id: NUM_COLS*y + x,
        class: 'cell',
      });
      cell.css("left", 40*x);
      cell.css("top", 40*y);
      content = ""
      if (isBomb(x,y)) {
        content = "B"
      } else {
        content = getBombNeighborCount(x, y);
      }
      cell.html(content)
      cell.click(function() {
        id = parseInt($(this).attr("id"))
        reveal(id%NUM_COLS, Math.floor(id/NUM_COLS));
      })
      $('.border').append(cell);
    }
  }

});