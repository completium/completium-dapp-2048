
import React from 'react';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import ArrowForward from '@material-ui/icons/ArrowForward';
import Grid from '@material-ui/core/Grid';

const iconMap = {
  'up'   : <ArrowUpwardIcon color='disabled'/>,
  'down' : <ArrowDownwardIcon color='disabled'/>,
  'left' : <ArrowBack color='disabled'/>,
  'right': <ArrowForward color='disabled'/>
}

const Actions = (props) => {
  return (
    <div>
      <Grid container wrap='nowrap' direction="row-reverse" justify="flex-end" alignItems="center" style={{ height: 55, paddingLeft: 5 }}>
        { props.arrows.map(a => <Grid item style={{ marginTop: 10, marginLeft: 5 }}> {iconMap[a]} </Grid>) }
      </Grid>
    </div>)
}

export default Actions;