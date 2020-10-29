import React, { useRef, useState } from "react";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Score from '../components/Score';
import styles from './style.css';

var count = 0;

function GameManager(size) {
  this.size         = size; // Size of the grid
 /*  this.inputManager = new InputManager;
  this.actuator     = new Actuator; */

  this.startTiles   = 2;

 /*  this.inputManager.on("move", this.move.bind(this));
  this.inputManager.on("restart", this.restart.bind(this)); */

  this.setup();
}

// Restart the game
/* GameManager.prototype.restart = function () {
  this.actuator.restart();
  this.setup();
}; */

// Set up the game
GameManager.prototype.setup = function () {
  this.grid         = new Board(this.size);

  this.score        = 0;
  this.over         = false;
  this.won          = false;

  // Add the initial tiles
  this.addStartTiles();

  // Update the actuator
  /* this.actuate(); */
};

// Set up the initial tiles to start the game with
GameManager.prototype.addStartTiles = function () {
  for (var i = 0; i < this.startTiles; i++) {
    this.addRandomTile();
  }
};

// Adds a tile in a random position
GameManager.prototype.addRandomTile = function () {
  if (this.grid.cellsAvailable()) {
    var value = Math.random() < 0.9 ? 2 : 4;
    var tile = new Tile(this.grid.randomAvailableCell(), value, count++);

    this.grid.insertTile(tile);
  }
};

// Sends the updated grid to the actuator
/* GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    score: this.score,
    over:  this.over,
    won:   this.won
  });
}; */

// Save all tile positions and remove merger info
GameManager.prototype.prepareTiles = function () {
  this.grid.eachCell(function (x, y, tile) {
    if (tile) {
      tile.mergedFrom = null;
      tile.savePosition();
    }
  });
};

// Move a tile and its representation
GameManager.prototype.moveTile = function (tile, cell) {
  this.grid.cells[tile.x][tile.y] = null;
  this.grid.cells[cell.x][cell.y] = tile;
  tile.updatePosition(cell);
};

// Move tiles on the grid in the specified direction
GameManager.prototype.move = function (direction) {
  // 0: up, 1: right, 2:down, 3: left
  var self = this;

  if (this.over || this.won) return; // Don't do anything if the game's over

  var cell, tile;

  var vector     = this.getVector(direction);
  var traversals = this.buildTraversals(vector);
  var moved      = false;

  // Save the current tile positions and remove merger information
  this.prepareTiles();

  // Traverse the grid in the right direction and move tiles
  traversals.x.forEach(function (x) {
    traversals.y.forEach(function (y) {
      cell = { x: x, y: y };
      tile = self.grid.cellContent(cell);

      if (tile) {
        var positions = self.findFarthestPosition(cell, vector);
        var next      = self.grid.cellContent(positions.next);

        // Only one merger per row traversal?
        if (next && next.value === tile.value && !next.mergedFrom) {
          var merged = new Tile(positions.next, tile.value * 2, count++);
          merged.mergedFrom = [tile, next];

          self.grid.insertTile(merged);
          self.grid.removeTile(tile);

          // Converge the two tiles' positions
          tile.updatePosition(positions.next);

          // Update the score
          self.score += merged.value;

          // The mighty 2048 tile
          if (merged.value === 2048) self.won = true;
        } else {
          self.moveTile(tile, positions.farthest);
        }

        if (!self.positionsEqual(cell, tile)) {
          moved = true; // The tile moved from its original cell!
        }
      }
    });
  });

  if (moved) {
    this.addRandomTile();

    if (!this.movesAvailable()) {
      this.over = true; // Game over!
    }

    /* this.actuate(); */
  }
};

// Get the vector representing the chosen direction
GameManager.prototype.getVector = function (direction) {
  // Vectors representing tile movement
  var map = {
    0: { x: 0,  y: -1 }, // up
    1: { x: 1,  y: 0 },  // right
    2: { x: 0,  y: 1 },  // down
    3: { x: -1, y: 0 }   // left
  };

  return map[direction];
};

// Build a list of positions to traverse in the right order
GameManager.prototype.buildTraversals = function (vector) {
  var traversals = { x: [], y: [] };

  for (var pos = 0; pos < this.size; pos++) {
    traversals.x.push(pos);
    traversals.y.push(pos);
  }

  // Always traverse from the farthest cell in the chosen direction
  if (vector.x === 1) traversals.x = traversals.x.reverse();
  if (vector.y === 1) traversals.y = traversals.y.reverse();

  return traversals;
};

GameManager.prototype.findFarthestPosition = function (cell, vector) {
  var previous;

  // Progress towards the vector direction until an obstacle is found
  do {
    previous = cell;
    cell     = { x: previous.x + vector.x, y: previous.y + vector.y };
  } while (this.grid.withinBounds(cell) &&
           this.grid.cellAvailable(cell));

  return {
    farthest: previous,
    next: cell // Used to check if a merge is required
  };
};

GameManager.prototype.movesAvailable = function () {
  return this.grid.cellsAvailable() || this.tileMatchesAvailable();
};

// Check for available matches between tiles (more expensive check)
GameManager.prototype.tileMatchesAvailable = function () {
  var self = this;

  var tile;

  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      tile = this.grid.cellContent({ x: x, y: y });

      if (tile) {
        for (var direction = 0; direction < 4; direction++) {
          var vector = self.getVector(direction);
          var cell   = { x: x + vector.x, y: y + vector.y };

          var other  = self.grid.cellContent(cell);
          if (other) {
          }

          if (other && other.value === tile.value) {
            return true; // These two tiles can be merged
          }
        }
      }
    }
  }

  return false;
};

GameManager.prototype.positionsEqual = function (first, second) {
  return first.x === second.x && first.y === second.y;
};

function Board(size) {
  this.size = size;

  this.cells = [];

  this.build();
}

// Build a grid of the specified size
Board.prototype.build = function () {
  for (var x = 0; x < this.size; x++) {
    var row = this.cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }
};

// Find the first available random position
Board.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

Board.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Board.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Board.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Board.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Board.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Board.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Board.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Board.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Board.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

function Tile(position, value, id) {
  this.x                = position.x;
  this.y                = position.y;
  this.value            = value || 2;
  this.id               = id;

  this.previousPosition = null;
  this.mergedFrom       = null; // Tracks tiles that merged together
}

Tile.prototype.savePosition = function () {
  this.previousPosition = { x: this.x, y: this.y };
};

Tile.prototype.updatePosition = function (position) {
  this.x = position.x;
  this.y = position.y;
};

function getInitialGameManager(size) {
  return new GameManager(size);
}

const GridContainer = () => {
  return (
    <div class="grid-container">
      <div class="grid-row">
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
      </div>
      <div class="grid-row">
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
      </div>
      <div class="grid-row">
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
        <Cell className="grid-cell"/>
      </div>
      <div class="grid-row">
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
        <div class="grid-cell"></div>
      </div>
    </div>
  )
}

const normalizePosition = (position) => {
  return { x: position.x + 1, y: position.y + 1 };
}

const positionClass = (position) => {
  position = normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
}

const Cell = (props) => {
  return (<div className={props.className}></div>)
}

const addTile = (elements, tile) => {
  var position  = tile.previousPosition || { x: tile.x, y: tile.y };
  var posClass = positionClass(position);
  var classes = ["tile", "tile-" + tile.value, posClass];

  if (tile.previousPosition) {
    // Make sure that the tile gets rendered in the previous position first
    classes[2] = positionClass({ x: tile.x, y: tile.y });
    /* self.applyClasses(element, classes); // Update the position */
  } else if (tile.mergedFrom) {
    classes.push("tile-merged");
    /* this.applyClasses(element, classes); */

    // Render the tiles that merged
    tile.mergedFrom.forEach(function (merged) {
      addTile(elements, merged);
    });
  } else {
    classes.push("tile-new");
    /* this.applyClasses(element, classes); */
  }
  elements.push({ classes: classes.join(' '), value : tile.value, id: tile.id });
}

const mapkeys = { up: 0, down: 2, right: 1, left: 3}

const getElements = (gm) => {
  var elements = [];
  gm.grid.cells.forEach(function (column) {
    column.forEach(function (cell) {
      if (cell) {
        addTile(elements, cell);
      }
    });
  });
  return elements;
}

const Game = (props) => {
  const gameManager = useRef(getInitialGameManager(props.size));
  const [elements, setElements] = useState(getElements(gameManager.current));
  const [score, setScore] = useState({ score: 0, delta: 0});
  const move = (key) => {
    var d = mapkeys[key];
    var score = gameManager.current.score;
    gameManager.current.move(d);
    var newscore = gameManager.current.score;
    var delta = newscore - score;
    setElements(getElements(gameManager.current));
    setScore({ score: newscore, delta: delta });
  }
  return (
  <Grid container direction="row"  justify="center" alignItems="center" style={{ width: '494px' }}>
    <Grid item xs={9}>
      <Typography variant='h2' style={{
        fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
        fontWeight: 700 }}>2048</Typography>
    </Grid>
    <Grid item xs={3}>
      <Score score={score} />
    </Grid>
    <Grid item>
      <Paper style={{ width: '494px', height: '494px', padding: 12 }}>
        <KeyboardEventHandler
          handleKeys={['up', 'down', 'left', 'right']}
          onKeyEvent={(key, e) => move(key)}
        />
        <GridContainer />
        <div class="tile-container"> {
          elements.map(element =>
            <div key={element.id} className={element.classes} style={{ color: (element.value>4)?'white':'#776E65'}}>{element.value}</div>
          )
        } </div>
      </Paper>
    </Grid>
  </Grid>
  )
}

export default Game;