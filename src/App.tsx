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
import { TaskListItem } from './components/TaskListItem';
import {
  Route,
  Switch,
  Redirect,
  BrowserRouter,
} from 'react-router-dom';
import idGen from './core/idgen';
import PopupProvider from './components/PopupProvider';
import Button from '@material-ui/core/Button';
import StickyNav from './components/StickyNav';
import './App.less';

const ListPage = lazy(() => import('./pages/List'));

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

  // TODO: Mock
  useEffect(() => {
    const defaultTaskId = idGen();
    setCurrentActiveTaskIds([defaultTaskId]);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <StickyNav className="app-nav">
          <PopupProvider
            trigger={<Button>test</Button>}
            triggerClass="test"
          >
            <>
              <span>asidhaoisdjaosidjasoidj</span><br />
              <span>asidaosidjaosidjaosdaoisjd</span>
            </>
          </PopupProvider>
        </StickyNav>
        <div className="app-page">
          <Suspense fallback={<></>}>
            <BrowserRouter>
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
            </BrowserRouter>
          </Suspense>
        </div>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default App;
