import React from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Divider } from '@material-ui/core';
import { records } from '../settings';

import Actions from './Actions';

import useWindowDimensions from './WindowDimensions';

const Competition = (props) => {
  const { height, width } = useWindowDimensions();
  const leaderBoardHeight = (height - 550)+'px';
  console.log(leaderBoardHeight);
  return (
    <Paper elevation='0' square style={{ paddingTop: 10 }}>
      <Grid container direction="row" justify="flex-start" alignItems="center" spacing={2} style={{
        paddingLeft: 15,
        paddingTop: 15,
        overflow: 'scroll' }}>
        <Grid item xs={3} style={{ padding: 10 }}>
          <Typography color='textSecondary'>Account:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography style={{
            fontFamily: 'Courier Prime, monospace'
          }}>tz1dZydwVDuz6SH5jCUfCQjqV8YCQimL9GCp
          </Typography>
        </Grid>
        <Grid item xs={3} style={{ padding: 10 }}>
          <Typography color='textSecondary'>Session id:</Typography>
        </Grid>
        <Grid item xs={9}>
          <Typography style={{
            fontFamily: 'Courier Prime, monospace'
          }}>{props.session}
          </Typography>
        </Grid>
      </Grid>
      <Grid container direction="column" justify="center" alignItems="center" style={{
        marginTop: 20,
        backgroundImage : "url(" + process.env.PUBLIC_URL + '/podium.svg)',
        backgroundRepeat  : 'no-repeat',
        backgroundPosition: 'right 50% top 220px',
      }}>
        <Grid item>
          <Typography color='textSecondary' style={{ fontWeight: 700, padding: 10 }}>Session actions</Typography>
        </Grid>
        <Grid item style={{ width: '100%' }}>
          <Divider></Divider>
        </Grid>
        <Grid item style={{ width: '100%', overflow: 'hidden' }}>
          <Actions arrows={props.arrows} />
        </Grid>
        <Grid item style={{ width: '100%' }}>
          <Divider></Divider>
        </Grid>
        <Grid item>
          <Typography color='textSecondary'>{props.arrows.length}</Typography>
        </Grid>
        <Grid item style={{ marginTop: 30, marginBottom: 30 }}>
          <Button variant='contained' color='secondary' disableElevation>compute & encrypt score</Button>
        </Grid>
        <Grid item>
          <Typography color='textSecondary' style={{
            fontWeight: 700,
            marginTop: 30,
            marginBottom: 80
          }}>Leader Board
          </Typography>
        </Grid>
        <Grid container direction="row" justify="center" alignItems="center" style={{
          height: leaderBoardHeight,
          overflow: 'scroll'
        }}>
          <Grid item xs={2} style={{
            paddingLeft: 20,
            fontWeight: 700
          }}><Typography color='textSecondary'>Rank</Typography></Grid>
          <Grid item xs={2} style={{
            paddingLeft: 10,
            fontWeight: 700
          }}><Typography color='textSecondary'>Score</Typography></Grid>
          <Grid item xs={8} style={{
            paddingLeft: 10,
            fontWeight: 700
          }}><Typography color='textSecondary'>Account</Typography></Grid>
        {
          records.map(record =>
          <Grid container direction="row" justify="center" alignItems="center" style={{
            padding: 12,
            paddingLeft: 20
          }}>
            <Grid item xs={2}>
              <Typography>#1</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>{record.score}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography style={{
                fontFamily: 'Courier Prime, monospace'
              }}>{record.account}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider></Divider>
            </Grid>
          </Grid>)
        }
        </Grid>
      </Grid>

    </Paper>
  )
}

export default Competition;