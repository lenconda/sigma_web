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
  Typography,
} from '@material-ui/core';
import Bus from './core/bus';
import Dispatcher from './core/dispatcher';
import { Dispatch } from './components/TaskList';
import { TaskListItem } from './components/TaskListItem';
import {
  Route,
  Switch,
  Redirect,
  Router,
  Link,
} from 'react-router-dom';
import idGen from './core/idgen';
import PopupProvider from './components/PopupProvider';
import Button from '@material-ui/core/Button';
import StickyNav from './components/StickyNav';
import DatePicker from './components/DatePicker';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { createBrowserHistory } from 'history';
import DateRangeIcon from '@material-ui/icons/DateRange';
import Sticky from './components/Sticky';
import moment from 'moment';
import {
  getTaskListFromTask,
} from './services/task';
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

const history = createBrowserHistory();

export interface AppMenu {
  name: string;
  path: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

const generatePopupMenu = (menus: Record<string, string>): JSX.Element[] => {
  return Object.keys(menus).map((path, index) => {
    return <Link to={path} key={index} className="link">
      <MenuItem>{menus[path]}</MenuItem>
    </Link>;
  });
};

const generateDateString = (start?: Date, end: Date = start): string => {
  if (!start) { return '' }
  const today = moment().startOf('day');
  const todayString = today.format('YYYY-MM-DD');
  const startMoment = moment(start);
  const endMoment = moment(end);
  const startTimestamp = startMoment.valueOf();
  const endTimestamp = endMoment.valueOf();
  const startString = startMoment.format('YYYY-MM-DD');
  const endString = endMoment.format('YYYY-MM-DD');
  if (startTimestamp === endTimestamp) {
    return today.valueOf() === startTimestamp
      ? `今天 (${todayString})`
      : startString;
  } else {
    return `${startString} - ${endString}`;
  }
};

const App: React.FC = () => {
  const bus = new Bus<Dispatch>();
  const dispatcher = new Dispatcher();
  const [currentActiveTaskIds, setCurrentActiveTaskIds] = useState<string[]>([]);
  const [menus, setMenus] = useState<Record<string, string>>({
    '/list': '任务列表',
    '/summary': '摘要',
  });
  const [avatarMenus, setAvatarMenus] = useState<Record<string, string>>({
    '/profile': '账户设置',
    '/exit': '登出',
  });
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  const [defaultTasks, setDefaultTasks] = useState<TaskListItem[]>([]);

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
    const today = moment().startOf('day').toDate();
    getTaskListFromTask('0', 10).then(res => {
      setDefaultTasks(res);
    });
    setDateRange({
      start: today,
      end: today,
    });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <Router history={history}>
          <Sticky direction="horizontal" className="app-sidebar">
            <>
              {/* <PopupProvider
                closeOnClick={true}
                trigger={
                  <Button variant="outlined" endIcon={<ExpandMoreIcon />}>
                    {menus[history.location.pathname.split('/').slice(0, 2).join('/')]}
                  </Button>
                }
              >
                <MenuList>
                  {generatePopupMenu(menus)}
                </MenuList>
              </PopupProvider> */}
              <DatePicker
                startDate={(dateRange && dateRange.start)}
                endDate={(dateRange && dateRange.end)}
                selectsRange={true}
                onConfirm={result => {
                  if (Array.isArray(result)) {
                    const [start, end] = result;
                    console.log(result);
                    setDateRange({ start, end });
                  }
                }}
                customComponent={
                  <Button startIcon={<DateRangeIcon />}>
                    <Typography noWrap={true}>
                      {generateDateString((dateRange && dateRange.start), (dateRange && dateRange.end))}
                    </Typography>
                  </Button>
                }
              />
              {
                defaultTasks.map((task, index) => {
                  return <button
                    key={index}
                    onClick={() => {
                      setCurrentActiveTaskIds([task.taskId]);
                    }}
                  >
                    {task.content}
                  </button>;
                })
              }
            </>
          </Sticky>
          {/* <StickyNav className="app-nav">
            <>
              <div className="app-nav__menus--left">
                <PopupProvider
                  closeOnClick={true}
                  trigger={
                    <Button variant="outlined" endIcon={<ExpandMoreIcon />}>
                      {menus[history.location.pathname.split('/').slice(0, 2).join('/')]}
                    </Button>
                  }
                >
                  <MenuList>
                    {generatePopupMenu(menus)}
                  </MenuList>
                </PopupProvider>
              </div>
              <div className="app-nav__menus--center">
                <DatePicker
                  startDate={(dateRange && dateRange.start)}
                  endDate={(dateRange && dateRange.end)}
                  selectsRange={true}
                  onConfirm={result => {
                    if (Array.isArray(result)) {
                      const [start, end] = result;
                      setDateRange({ start, end });
                    }
                  }}
                  customComponent={
                    <Button variant="outlined" startIcon={<DateRangeIcon />} endIcon={<ExpandMoreIcon />}>
                      {generateDateString((dateRange && dateRange.start), (dateRange && dateRange.end))}
                    </Button>
                  }
                />
              </div>
              <div className="app-nav__menus--right">
                <PopupProvider
                  closeOnClick={true}
                  trigger={
                    <Button variant="outlined">
                      <div className="avatar_wrapper">
                        <img src="/assets/images/default_avatar.svg" width="20" />
                      </div>
                    </Button>
                  }
                >
                  <MenuList>
                    {generatePopupMenu(avatarMenus)}
                  </MenuList>
                </PopupProvider>
              </div>
            </>
          </StickyNav> */}
          <div className="app-page">
            <Suspense fallback={<></>}>
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
            </Suspense>
          </div>
        </Router>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default App;
