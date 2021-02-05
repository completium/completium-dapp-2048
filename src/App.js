import React, { useState, useRef } from 'react';
import './App.css';
import Game from './game/Game';
import { appTitle, appName, contractAddress, network } from './settings.js';
import HeaderBar from './components/HeaderBar';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Competition from './components/Competition';
import { GameServer } from './server/GameServer';
import { DAppProvider, useConnect } from './dapp.js';
import SnackMsg from './components/SnackMsg';
import { TezosToolkit } from '@taquito/taquito';

function App() {
  return (
    <DAppProvider appName={appName}>
      <React.Suspense fallback={null}>
        <PageRouter />
      </React.Suspense>
    </DAppProvider>
  );
}

function sortByScore(records) {
  records.sort((a, b) => {
    return b.score - a.score;
  });
  return records.map((x, i) => { return { rank: i+1, score: x.score, account: x.account }});
}

const PageRouter = (props) => {
  var connect = useConnect();
  const prefersDarkMode = false; /*useMediaQuery('(prefers-color-scheme: dark)');*/
  const [arrows, setArrows] = useState([]);
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState(null);
  const [status, setStatus] = useState(0);
  const [signed, setSigned] = useState({ packed: null, value: null});
  const [score, setScore] = useState({ score: 0, delta: 0});
  const [viewSnack, setViewSnack] = React.useState(false);
  const GameServerRef = useRef(new GameServer());
  const handleKey = (key) => {
    var a = [...arrows];
    if (key === '') {
      a = [];
    } else {
      a.push(key);
    }
    setArrows(a);
  }
  const theme = React.useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light',
          secondary: {
            light: '#fd7b52',
            main: '#ff5722',
            dark: '#b32b00',
            contrastText: '#fff',
          }
        },
      }),
    [prefersDarkMode],
  );
  const handleConnect = React.useCallback(async () => {
    try {
      await connect(network);
    } catch (err) {
      alert(err.message);
    };
  }, [connect]);
  async function newSession() {
    var id = await GameServerRef.current.newSession()
    setSession(id);
  }
  if (session === null) {
    newSession();
  }
  async function loadRecords() {
    try {
      ///////////////////////////////////////////////////////////////////////////
      // FIX ME
      // read contract storage, mainly submission and call DApp's 'setRecords'
      ///////////////////////////////////////////////////////////////////////////
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
  if (records === null) {
    loadRecords();
  }
  const openSnack = () => {
    setViewSnack(true);
  }
  const closeSnack = () => {
    setViewSnack(false);
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <HeaderBar appTitle={appTitle} handleConnect={handleConnect} theme={theme}/>
      <Grid container direction="row" justify="center" alignItems="flex-start" >
        <Grid item xs={8}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item>
              <Game
                size={4}
                handleKey={handleKey}
                newSession={newSession}
                next={GameServerRef.current.next}
                setSigned={setSigned}
                setScore={setScore}
                score={score}
                signed={signed}
                loadRecords={loadRecords}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <Competition
            arrows={arrows}
            session={session}
            records={records}
            signed={signed}
            setSigned={setSigned}
            score={score}
            openSnack={openSnack}
            closeSnack={closeSnack}
            loadRecords={loadRecords}
            status={status}
          />
        </Grid>
      </Grid>
      <SnackMsg open={viewSnack} theme={theme} />
    </ThemeProvider>
  )
}


export default App;
