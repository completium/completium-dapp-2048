import React from 'react';
import './App.css';
import Game from './game/Game';
import { appTitle, appName, contractAddress, network } from './settings.js';
import HeaderBar from './components/HeaderBar';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import useMediaQuery from '@material-ui/core/useMediaQuery';

function App() {
  return (
    <PageRouter />
  );
}

const PageRouter = (props) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline/>
      <HeaderBar appTitle={appTitle} handleConnect={handleConnect} />
      <Grid container direction="row" justify="center" alignItems="center">
        <Grid item>
          <Game size={4} />
        </Grid>
      </Grid>
    </ThemeProvider>
  )
}


export default App;
