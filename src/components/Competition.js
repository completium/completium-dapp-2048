import React, { useState } from 'react';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import { Divider, LinearProgress } from '@material-ui/core';
import { useReady, useAccountPkh, useTezos } from '../dapp.js';
import { InMemorySigner } from '@taquito/signer';
import { contractAddress } from '../settings.js';
import { Tezos } from '@taquito/taquito';

import Actions from './Actions';

import useWindowDimensions from './WindowDimensions';

const fromHexString = hexString =>
  new Uint8Array(hexString.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
const toHexString = bytes =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

const Encrypt = (props) => {
  const ready = useReady();
  const tezos = useTezos();
  const handleEncrypt = () => {
    var oracle = new InMemorySigner('edsk3BksmijaVkBoi485CHA7X9pDfexAwSWiQum6WAHNaLot2SXfyW');
    var nonce = new Uint8Array(8);
    window.crypto.getRandomValues(nonce);
    console.log(`score: ${props.score.score}`);
    Tezos.setProvider({ rpc: 'https://testnet-tezos.giganode.io/' });
    Tezos.rpc.packData({
      data: {
        prim: "Pair",
        args: [
          { string: "tz1Lc2qBKEWCBeDU8npG6zCeCqpmaegRi6Jg" },
          { int: props.score.score.toString() }
        ]
      }, type: {
        prim: "pair",
        args: [
          { prim: "address" },
          { prim: "nat" }
        ]
      }
    }).then(wrappedPacked => {
      const hexScore = wrappedPacked.packed;
      oracle.sign(hexScore).then(s => {
        console.log(`score: ${props.score.score.toString(16)}`);
        console.log(`signed: ${s.sbytes}`);
        console.log(`sig: ${s.sig}`);
        console.log(`prefix: ${s.prefixSig}`);
        props.setSigned({ packed: wrappedPacked.packed, value: s.prefixSig });
      });
    })
  }
  const submit = () => {
    tezos.wallet.at(contractAddress).then(contract => {
      contract.methods.submit(props.signed.packed, props.signed.value).send().then(op => {
        props.openSnack();
        op.receipt().then(() => {
          props.closeSnack();
          props.loadRecords();
        });
      });
    });
  }
  if (props.signed.value === null) {
    return (
      <Grid item style={{ marginTop: 30, marginBottom: 30 }}>
        <Button
          variant='contained'
          color='secondary'
          disableElevation
          onClick={handleEncrypt}>
          compute & encrypt score
      </Button>
      </Grid>);
  } else {
    return (
      <Grid item>
        <Grid container="column" justify="center" alignItems="center">
          <Grid item>
            <Typography style={{
              paddingTop: 30,
              paddingBottom: 6,
              fontFamily: 'Courier Prime, monospace'
            }}>{props.signed.value.substring(0, 50) + '...'}</Typography>
          </Grid>
          <Grid item>
            <Button
              variant='contained'
              color='secondary'
              disableElevation
              disabled={!ready}
              onClick={submit}
            >
              submit
          </Button>
          </Grid>
        </Grid>
      </Grid>);
  }
}

const LeaderBoard = (props) => {
  return (
    <Grid container direction="row" justify="center" alignItems="center" style={{
      height: props.height,
      overflow: 'scroll'
    }}>
      <Grid item xs={2} style={{
        paddingLeft: 20,
        fontWeight: 700,
        textAlign: 'center'
      }}><Typography color='textSecondary'>Rank</Typography></Grid>
      <Grid item xs={2} style={{
        paddingLeft: 10,
        fontWeight: 700
      }}><Typography color='textSecondary'>Score</Typography></Grid>
      <Grid item xs={8} style={{
        paddingLeft: 10,
        fontWeight: 700,
        textAlign: 'center'
      }}><Typography color='textSecondary'>Account</Typography></Grid>
      <Grid item xs={12}> {
        props.records.map(record =>
          <Grid container direction="row" justify="center" alignItems="center" style={{
            padding: 12,
            paddingLeft: 0,
            paddingRight: 0
          }}>
            <Grid item xs={2}>
              <Typography style={{ textAlign: 'center' }}>#{record.rank}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography style={{ marginRight: 10 }}>{record.score}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Typography style={{
                fontFamily: 'Courier Prime, monospace'
              }}>{record.account}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Divider></Divider>
            </Grid>
          </Grid>)}
      </Grid>
    </Grid>
  )
}

const Competition = (props) => {
  const ready = useReady();
  const address = useAccountPkh();
  const { height, width } = useWindowDimensions();
  const leaderBoardHeight = (height - 550) + 'px';
  const leaderBoardWidth = (Math.floor(0.3 * width)) + 'px';
  return (
    <Paper elevation='0' square style={{ paddingTop: 10 }}>
      <Grid container direction="row" justify="flex-start" alignItems="center" spacing={2} style={{
        paddingLeft: 15,
        paddingTop: 15,
        overflow: 'scroll'
      }}>
        <Grid item xs={3} style={{ padding: 10 }}>
          <Typography color='textSecondary'>Account:</Typography>
        </Grid>
        <Grid item xs={9}>
          {(ready) ? (<Typography style={{
            fontFamily: 'Courier Prime, monospace'
          }}>{address}
          </Typography>
          ) : (
              <div></div>
            )
          }
        </Grid>
        <Grid item xs={3} style={{ padding: 10 }}>
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
        backgroundImage: "url(" + process.env.PUBLIC_URL + '/podium.svg)',
        backgroundRepeat: 'no-repeat',
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
        <Encrypt
          signed={props.signed}
          setSigned={props.setSigned}
          score={props.score}
          signed={props.signed}
          openSnack={props.openSnack}
          closeSnack={props.closeSnack}
          loadRecords={props.loadRecords}
        />
        <Grid item>
          <Typography color='textSecondary' style={{
            fontWeight: 700,
            marginTop: 30,
            marginBottom: 80
          }}>Leader Board
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {(props.records === null) ? (
            <div style={{ marginTop: 40, height: 40, width: leaderBoardWidth }}>
              <LinearProgress color='secondary'></LinearProgress>
            </div>
          ) : (
              <LeaderBoard height={leaderBoardHeight} records={props.records} />
            )
          }
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Competition;