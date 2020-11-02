import React, { useRef, useState } from "react";
import KeyboardEventHandler from 'react-keyboard-event-handler';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Score from '../components/Score';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import styles from './style.css';
import { GameManager } from '../components/GameManager';

function getInitialGameManager(seed, size) {
  return new GameManager(seed, size);
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
  const gameManager = useRef(getInitialGameManager(Math.random(), props.size));
  const [elements, setElements] = useState(getElements(gameManager.current));
  const [msg, setMsg] = useState(null);
  const move = (key) => {
    var d = mapkeys[key];
    var score = gameManager.current.score;
    gameManager.current.move(d);
    var newscore = gameManager.current.score;
    var delta = newscore - score;
    setElements(getElements(gameManager.current));
    props.setScore({ score: newscore, delta: delta });
    if (gameManager.current.over) {
      setMsg('Game Over');
    } else if (gameManager.current.won) {
      setMsg('You Win!');
    } else {
      props.handleKey(key);
    }
  }
  const restart = () => {
    gameManager.current = getInitialGameManager(Math.random(), props.size);
    setElements(getElements(gameManager.current));
    props.setScore({ score: 0, delta: 0});
    setMsg(null);
    props.handleKey('');
    props.newSession();
    props.setSigned(null);
  }
  return (
  <Grid container direction="row"  justify="center" alignItems="center" style={{ width: '494px' }}>
    <Grid item xs={9}>
      <Typography variant='h2' style={{
        fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
        fontWeight: 700 }}>2048</Typography>
      <Typography style= {{
        fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
      }}> Join the numbers and get to the <b>2048 tile</b>!</Typography>
    </Grid>
    <Grid item xs={3}>
      <Score score={props.score} />
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
    <Grid style={{ marginTop: '12px' }}>
      <Button
        color='secondary'
        onClick={restart}
      >
      restart
      </Button>
    </Grid>
    { (msg === null)? <div></div>
    : (
      <Grid item style={{ height: 0 }}>
        <Paper style={{
          width: '494px',
          height: '494px',
          padding: 12,
          position: 'relative',
          top: '-542px',
          opacity: 0.8,
          zIndex: 100 }}>
          <Grid container direction="row" justify="center" alignItems="center" style={{ height: '370px' }}>
            <Grid item>
              <Typography variant='h5' style={{
                fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
                fontWeight: 700 }}>{msg}</Typography>
            </Grid>
          </Grid>
        </Paper>
      </Grid>)
    }
    <Grid item>
      <Typography style={{
        fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
      }}><b>HOW TO PLAY</b>: Use your <b>arrow keys</b> to move the tiles. When two tiles with the same number touch,
        they <b>merge into one!</b></Typography>
    </Grid>
    <Grid item xs={12} style={{ paddingTop: '20px', paddingBottom: '20px' }}>
      <Divider/>
    </Grid>
    <Grid item>
      <Typography style={{
        fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
      }}>Created by Gabriele Cirulli. Based on 1024 by Veewo Studio and conceptually similar to Threes by Asher Vollmer.</Typography>
    </Grid>
  </Grid>
  )
}

export default Game;