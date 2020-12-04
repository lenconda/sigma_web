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
  BrowserRouter as Router,
} from 'react-router-dom';

const HomePage = lazy(() => import('./pages/Home'));

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
    MuiButtonGroup: {
      disableFocusRipple: true,
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
    fontSize: 13,
  },
});

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
      <Router>
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
