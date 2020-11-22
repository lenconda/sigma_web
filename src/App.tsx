import React, { useEffect, useState, Suspense, lazy } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Bus from './core/bus';
import Dispatcher from './core/dispatcher';
import { Dispatch } from './components/TaskList';
import { TaskListItem } from './components/TaskListItem';
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

  const handleSelectedTasksChange = (tasks: TaskListItem[]) => {
    if (tasks.length === 1) {
      const task = tasks[0];
      const activeParentIndex = currentActiveTaskIds.indexOf(task.parentTaskId);
      if (activeParentIndex !== -1) {
        const newActiveTaskIds = Array.from(currentActiveTaskIds).slice(activeParentIndex).concat([task.taskId]);
        setCurrentActiveTaskIds(newActiveTaskIds);
      }
    }
  };

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
              <ListPage
                bus={bus}
                currentActiveTaskIds={currentActiveTaskIds}
                onSelectedTasksChange={handleSelectedTasksChange}
              />
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
