TILE_PIXEL_LENGTH = 16

NUM_ROWS = 16
NUM_COLS = 16
MAX_BOMBS = 40
NEIGHBOR_RELATIVE_COORDS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];

let BOMBS = [];
for (let i = 0; i < MAX_BOMBS; i++) {
  BOMBS.push(Math.floor(Math.random() * NUM_COLS * NUM_ROWS));
}

console.log(BOMBS);

function getNeighborCoords(x, y) {
  let out = []
  for (let i = 0; i < NEIGHBOR_RELATIVE_COORDS.length; i++) {
    let c = NEIGHBOR_RELATIVE_COORDS[i][0]
    let r = NEIGHBOR_RELATIVE_COORDS[i][1]
    if (x == 0 && c == -1) continue;
    if (x == NUM_COLS - 1 && c == 1) continue;
    if (y == 0 && r == -1) continue;
    if (y == NUM_ROWS - 1 && r == 1) continue;
    out.push([x + c, y + r])
  }
  return out
}

function getBombNeighborCount(x, y) {
  let count = 0
  let coords = getNeighborCoords(x, y);
  for (let i = 0; i < coords.length; i++) {
    let c = coords[i]
    if (BOMBS.includes(c[0] + NUM_COLS*c[1])) {
      count++;
    }
  }
  return count;
}

function isBomb(x, y) {
  return BOMBS.includes(x + NUM_COLS * y);
}

function reveal(x, y) {
  let id = x + NUM_COLS * y;
  $("#" + id).addClass("revealed");
  console.log($("#" + id).attr("class"));

}

function isRevealed(x, y) {
  let id = x + NUM_COLS * y;
  return $("#" + id).hasClass("revealed");
}

function revealDFS(x, y) {
  if (isRevealed(x, y)) {
    return;
  }
  reveal(x, y);

  if (getBombNeighborCount(x, y) > 0) {
    return;
  }

  let coords = getNeighborCoords(x, y);
  for(let i = 0; i < coords.length; i++) {
    revealDFS(coords[i][0], coords[i][1])
  }
}

$(document).ready(function() {
  $("h1").click(function() {
    $(this).hide();
  });

  for (let x = 0; x < NUM_COLS; x++) {
    for (let y = 0; y < NUM_ROWS; y++) {
      let cell = $('<div>', {
        id: NUM_COLS * y + x,
        class: 'cell',
      });
      cell.css("left", TILE_PIXEL_LENGTH * x);
      cell.css("top", TILE_PIXEL_LENGTH * y);
      if (isBomb(x, y)) {
        cell.addClass("bomb")
      } else {
        cell.addClass("c" + getBombNeighborCount(x, y))
      }
      cell.click(function() {
        let id = parseInt($(this).attr("id"))
        revealDFS(id % NUM_COLS, Math.floor(id / NUM_COLS));
      })
      $('.border').append(cell);
    }
  }

});