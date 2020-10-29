import { Grid, Paper, Typography } from "@material-ui/core";
import React from "react";

const Score = (props) => {
  return (
  <Grid container direction="column" justify="center" alignItems="center" style={{ height: 150 }}>
    <Grid item>

  <Paper style={{ paddingLeft: 12, paddingRight: 12 }}>
    <Grid container direction="column" justify="center" alignItems="center">
      <Grid item>
        <Typography style={{
          fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
          fontWeight: 700
        }}>SCORE</Typography>
      </Grid>
      <Grid item>
        <Typography variant='h4' style={{
          fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
          fontWeight: 700
        }}>
          {props.score.score}
        </Typography>
      </Grid>
    </Grid>
  </Paper>
  </Grid>
  <Grid item>
  <Typography variant='h6' style={{
    fontFamily: "Clear Sans, Helvetica Neue, Arial, sans-serif",
      fontWeight: 700,
      visibility: (props.score.delta > 0)?'visible':'hidden'
    }}>
    +{props.score.delta}
  </Typography>
  </Grid>
    </Grid>
  )
}

export default Score;