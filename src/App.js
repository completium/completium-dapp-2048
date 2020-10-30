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
import { SignalCellularNullRounded } from '@material-ui/icons';

function App() {
  return (
    <PageRouter />
  );
}

const PageRouter = (props) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [arrows, setArrows] = useState([]);
  const [session, setSession] = useState(null);
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
  const handleConnect = () => {};
  console.log(arrows);
  async function newSession() {
    var id = await GameServerRef.current.newSession()
    setSession(id);
  }
  if (session === null) {
    newSession();
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
                next={GameServerRef.current.next}/>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={4}>
          <Competition arrows={arrows} session={session}/>
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}


export default App;
