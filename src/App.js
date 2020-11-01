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
import { Tezos } from '@taquito/taquito';
import { DAppProvider, useConnect } from './dapp.js';

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
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [arrows, setArrows] = useState([]);
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState(null);
  const [signed, setSigned] = useState(null);
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
            light: '#968a7e',
            main: '#776E65',
            dark: '#544d47',
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
      Tezos.setProvider({rpc: 'https://testnet-tezos.giganode.io/'});
      console.log(contractAddress);
      var contract  = await Tezos.contract.at(contractAddress);
      var cstorage  = await contract.storage();
      var recs      = [];
      cstorage.submission.forEach((s, k, m) => {
        recs.push({
          score: parseInt('0'+s.score),
          account: k
        });
      });
      setRecords(sortByScore(recs));
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
  if (records === null) {
    loadRecords();
  }
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <HeaderBar appTitle={appTitle} handleConnect={handleConnect} theme={theme}/>
      <Grid container direction="row" justify="center" alignItems="flex-start" style={{ width: '99%' }} >
        <Grid item xs={8}>
          <Grid container direction="row" justify="center" alignItems="center">
            <Grid item>
              <Game
                size={4}
                handleKey={handleKey}
                newSession={newSession}
                next={GameServerRef.current.next}
                setSigned={setSigned}/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <Competition arrows={arrows} session={session} records={records} signed={signed} setSigned={setSigned}/>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}


export default App;
