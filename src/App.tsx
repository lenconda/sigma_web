import React, {
  useEffect,
  useState,
  Suspense,
  lazy,
} from 'react';
import {
  createMuiTheme,
  ThemeProvider,
  StylesProvider,
} from '@material-ui/core';
import Bus from './core/bus';
import Dispatcher from './core/dispatcher';
import { Dispatch } from './components/TaskList';
import {
  TaskListItem,
} from './components/TaskListItem';
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
  const bus = new Bus<Dispatch>();
  const dispatcher = new Dispatcher();
  const [currentActiveTaskIds, setCurrentActiveTaskIds] = useState<string[]>([]);

  const handleSelectedTasksChange = (tasks: TaskListItem[]) => {
    if (tasks.length === 1) {
      const task = tasks[0];
      const activeParentIndex = currentActiveTaskIds.indexOf(task.parentTaskId);
      if (activeParentIndex !== -1) {
        const newActiveTaskIds = activeParentIndex === currentActiveTaskIds.length - 1
          ? Array.from(currentActiveTaskIds).concat([task.taskId])
          : Array.from(currentActiveTaskIds).slice(0, activeParentIndex + 1).concat([task.taskId]);
        setCurrentActiveTaskIds(newActiveTaskIds);
      }
    }
  };

  useEffect(() => {
    dispatcher.start();
    const dispatchHandler = (dispatch: Dispatch) => {
      if (dispatch.payloads.length !== 0) {
        dispatcher.enqueue(dispatch);
        switch (dispatch.action) {
        case 'DELETE': {
          dispatch.payloads.forEach(payload => {
            // eslint-disable-next-line max-nested-callbacks
            const payloadActiveIndex = currentActiveTaskIds.findIndex(taskId => payload.taskId === taskId);
            if (payloadActiveIndex !== -1) {
              setCurrentActiveTaskIds(currentActiveTaskIds.slice(0, payloadActiveIndex));
            }
          });
          break;
        }
        default:
          break;
        }
      }
    };
    bus.on('dispatch', dispatchHandler);

    return () => {
      bus.off('dispatch', dispatchHandler);
    };
  }, [bus, dispatcher]);

  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <Router history={history}>
          <Suspense fallback={<></>}>
            <Route
              path="/home"
              component={() => (
                <HomePage
                  bus={bus}
                  currentActiveTaskIds={currentActiveTaskIds}
                  onSelectedTasksChange={handleSelectedTasksChange}
                />
              )}
            />
            <Redirect to="/home" />
          </Suspense>
        </Router>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default App;
