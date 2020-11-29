import React, {
  Suspense,
  lazy,
} from 'react';
import {
  createMuiTheme,
  ThemeProvider,
} from '@material-ui/core';
import {
  Route,
  Switch,
  Redirect,
  Router,
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

const history = createBrowserHistory();

export interface AppMenu {
  name: string;
  path: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router history={history}>
        <Suspense fallback={<></>}>
          <Switch>
            <Route path="/home" component={HomePage} />
            <Redirect from="/" to="/home" exact={true} />
          </Switch>
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;
