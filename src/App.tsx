import React, {
  Suspense,
  lazy,
} from 'react';
import {
  createMuiTheme,
  ThemeProvider,
  StylesProvider,
} from '@material-ui/core';
import {
  Route,
  Router,
  Redirect,
} from 'react-router-dom';
import { createBrowserHistory } from 'history';

const HomePage = lazy(() => import('./pages/Home'));

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      main: '#c0c0c0',
    },
    tonalOffset: 0.3,
  },
  typography: {
    fontSize: 12,
  },
});

export const history = createBrowserHistory();

export interface AppMenu {
  name: string;
  path: string;
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <Router history={history}>
          <Suspense fallback={<></>}>
            <Route path="/home" component={HomePage} />
            <Redirect to="/home" />
          </Suspense>
        </Router>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default App;
