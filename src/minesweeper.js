NUM_ROWS = 20
NUM_COLS = 20
MAX_BOMBS = 70
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

BOMBS = [];
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
  let id = x + NUM_COLS * y
  $("#" + id).css("font-size", 14);

}

function isRevealed(x, y) {
  let id = x + NUM_COLS * y;
  return $("#" + id).css("font-size") != "0px";
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
      cell.css("left", 20 * x);
      cell.css("top", 20 * y);
      let content = ""
      if (isBomb(x, y)) {
        content = "B"
      } else {
        content = getBombNeighborCount(x, y);
      }
      cell.html(content)
      cell.click(function() {
        let id = parseInt($(this).attr("id"))
        revealDFS(id % NUM_COLS, Math.floor(id / NUM_COLS));
      })
      $('.border').append(cell);
    }
  }

});