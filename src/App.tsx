import React, { useEffect, useState, Suspense, lazy } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Bus from './core/bus';
import Dispatcher from './core/dispatcher';
import { Dispatch } from './components/TaskList';
import {
  Router,
  Route,
  Switch,
  Redirect,
} from 'react-router';
import { createBrowserHistory } from 'history';

const ListPage = lazy(() => import('./pages/List'));

const history = createBrowserHistory();

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

const App: React.FC = () => {
  const bus = new Bus<Dispatch>();
  const dispatcher = new Dispatcher();
  const [currentActiveTaskIds, setCurrentActiveTaskIds] = useState<string[]>([]);

  useEffect(() => {
    dispatcher.start();
    bus.on('dispatch', (dispatch: Dispatch) => {
      if (dispatch.payloads.length !== 0) {
        dispatcher.enqueue(dispatch);
      }
    });
    return () => {
      dispatcher.stop();
    };
  }, [bus, dispatcher]);

  return (
    <ThemeProvider theme={theme}>
      <Suspense fallback={<></>}>
        <Router history={history}>
          <Switch>
            <Route path="/list">
              <ListPage bus={bus} currentActiveTaskIds={currentActiveTaskIds} />
            </Route>
            <Route path="/">
              <Redirect to="/list" />
            </Route>
          </Switch>
        </Router>
      </Suspense>
    </ThemeProvider>
  );
};

export default App;
