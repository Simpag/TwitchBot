var canvas = document.getElementById('game');
var context = canvas.getContext('2d');
ResetVotes();

// get random whole numbers in a specific range
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

var grid = 16;
var count = 0;
var rightVotes = 0;
var leftVotes = 0;
var upVotes = 0;
var downVotes = 0;

const frameInterval = {frameInterval}; // Time between votes/frames in ms

var snake = {
  x: 160,
  y: 160,

  // snake velocity. moves one grid length every frame in either the x or y direction
  dx: grid,
  dy: 0,

  // keep track of all grids the snake body occupies
  cells: [],

  // length of the snake. grows when eating an apple
  maxCells: 4
};

var apple = {
  x: getRandomInt(0, 25) * grid,
  y: getRandomInt(0, 25) * grid
};

// game loop
function loop() {
  if (count < 4) {
    count++;
    requestAnimationFrame(loop);
    DrawFrame();
  } else {
    setTimeout(loop, frameInterval);
    SelectWinner();
  }
}

function DrawFrame() {
  context.clearRect(0,0,canvas.width,canvas.height);

  // move snake by it's velocity
  snake.x += snake.dx;
  snake.y += snake.dy;

  // wrap snake position horizontally on edge of screen
  if (snake.x < 0) {
    snake.x = canvas.width - grid;
  }
  else if (snake.x >= canvas.width) {
    snake.x = 0;
  }

  // wrap snake position vertically on edge of screen
  if (snake.y < 0) {
    snake.y = canvas.height - grid;
  }
  else if (snake.y >= canvas.height) {
    snake.y = 0;
  }

  // keep track of where snake has been. front of the array is always the head
  snake.cells.unshift({x: snake.x, y: snake.y});

  // remove cells as we move away from them
  if (snake.cells.length > snake.maxCells) {
    snake.cells.pop();
  }

  // draw apple
  context.fillStyle = 'red';
  context.fillRect(apple.x, apple.y, grid-1, grid-1);

  // draw snake one cell at a time
  context.fillStyle = 'green';
  snake.cells.forEach(function(cell, index) {

    // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
    context.fillRect(cell.x, cell.y, grid-1, grid-1);

    // snake ate apple
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;

      // canvas is 400x400 which is 25x25 grids
      apple.x = getRandomInt(0, 25) * grid;
      apple.y = getRandomInt(0, 25) * grid;
    }

    // check collision with all cells after this one (modified bubble sort)
    for (var i = index + 1; i < snake.cells.length; i++) {

      // snake occupies same space as a body part. reset game
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        snake.x = 160;
        snake.y = 160;
        snake.cells = [];
        snake.maxCells = 4;
        snake.dx = grid;
        snake.dy = 0;

        apple.x = getRandomInt(0, 25) * grid;
        apple.y = getRandomInt(0, 25) * grid;
      }
    }
  });
}



// listen to keyboard events to move the snake
function SelectWinner() {
  // prevent snake from backtracking on itself by checking that it's
  // not already moving on the same axis (pressing left while moving
  // left won't do anything, and pressing right while moving left
  // shouldn't let you collide with your own body)
  //console.log("Selecting winner");

  let _tmp = [rightVotes, leftVotes, upVotes, downVotes];
  let _win = _tmp.reduce((iMax, x, i, arr) => x > arr[iMax] ? i : iMax, 0);

  if (_win == 0 && _tmp[0] == 0) {
    _win = -1;
  }

  //console.log("Winner is: " + _win.toString());

  switch(_win) {
    case 0:
      // right
      if (snake.dx === 0) {
        snake.dx = grid;
        snake.dy = 0;
      }
    break;
    case 1:
      // left
      if (snake.dx === 0) {
        snake.dx = -grid;
        snake.dy = 0;
      }
    break;
    case 2:
      // up
      if (snake.dy === 0) {
        snake.dy = -grid;
        snake.dx = 0;
      }
    break;
    case 3:
      // down
      if (snake.dy === 0) {
        snake.dy = grid;
        snake.dx = 0;
      }
    break;
    default:
      //console.log("No winning vote, continuing on the same path")
    break;
  }

  DrawFrame();
  ResetVotes();
}

window.addEventListener('onEventReceived', function (obj) {
    const data = obj["detail"]["event"];
    const msg = data.renderedText
    let isCommand = false;

    if (msg[0] == '!') {
        isCommand = true;
        //console.log("Is command: " + msg);
    }

    if (isCommand) {
        switch(msg) {
            case "!right":
            case "!Right":
                Vote(0);
            break;
            case "!left":
            case "!Left":
                Vote(1);
            break;
            case "!up":
            case "!Up":
                Vote(2);
            break;
            case "!down":
            case "!Down":
                Vote(3);
            break;
        }
    }
});

function ResetVotes() {
    //console.log("Resetting votes!");
    rightVotes = 0;
    leftVotes = 0;
    upVotes = 0;
    downVotes = 0;
}

function Vote(_n) {
  switch(_n) {
    case 0:
      rightVotes++;
    break;
    case 1:
      leftVotes++;
    break;
    case 2:
      upVotes++;
    break;
    case 3:
      downVotes++;
    break;
  }
}

// start the game
requestAnimationFrame(loop);