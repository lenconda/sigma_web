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
      main: '#17a2b8',
    },
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
          <Route path="/home" component={HomePage} />
          <Redirect from="/" to="/home/list" exact={true} />
        </Suspense>
      </Router>
    </ThemeProvider>
  );
};

export default App;
