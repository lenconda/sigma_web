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
import Bus from '../../core/bus';
import Dispatcher from '../../core/dispatcher';
import { Dispatch } from '../../components/TaskList';
import {
  TaskListItem,
  User,
} from '../../components/TaskListItem';
import {
  Route,
  Switch,
  Redirect,
  Link,
  NavLink,
  RouteComponentProps,
} from 'react-router-dom';
import PopupProvider from '../../components/PopupProvider';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DatePicker from '../../components/DatePicker';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import FormatIndentIncreaseIcon from '@material-ui/icons/FormatIndentIncrease';
import NotificationsIcon from '@material-ui/icons/Notifications';
import { createBrowserHistory } from 'history';
import DateRangeIcon from '@material-ui/icons/DateRange';
import DebouncedTextField from '../../components/DebouncedTextField';
import moment from 'moment';
import idGen from '../../core/idgen';
import _merge from 'lodash/merge';
import {
  parseParams,
} from '../../utils/url';
import _cloneDeep from 'lodash/cloneDeep';
import {
  getTaskListFromTask,
} from '../../services/task';
import {
  getUserInfo,
} from '../../services/user';
import {
  getNavMenu,
  getAvatarMenu,
} from '../../services/menus';
import {
  ListIcon,
} from '../../core/icons/index';
import CustomIconButton from '../../components/IconButton';
import Drawer from '../../components/Drawer';
import './index.less';

const ListPage = lazy(() => import('./List'));

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

export interface AppMenuItem {
  name?: string;
  path?: string;
  isDivider?: boolean;
  icon?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface NotificationInfo {
  notificationId: string;
  title: string;
  time: string;
  checked: boolean;
  subject?: string;
  sender?: User;
  receiver?: User;
}

export interface NotificationDetailInfo extends NotificationInfo {
  content: string;
}

const generatePopupMenu = (menus: AppMenuItem[]): JSX.Element[] => {
  return menus.map((menu, index) => {
    const { isDivider, name, path } = menu;
    if (isDivider) {
      return <hr key={index} />;
    }
    if (name && path) {
      return <Link to={path} key={index} className="link">
        <MenuItem classes={{ root: 'app-menu-item' }}>
          <Typography noWrap={true} variant="body1">{name}</Typography>
        </MenuItem>
      </Link>;
    }
    return null;
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

export interface HomePageProps extends RouteComponentProps {}

const Home: React.FC<HomePageProps> = props => {
  const bus = new Bus<Dispatch>();
  const dispatcher = new Dispatcher();
  const [currentActiveTaskIds, setCurrentActiveTaskIds] = useState<string[]>([]);
  const [navMenus, setNavMenus] = useState<AppMenuItem[]>([]);
  const [avatarMenus, setAvatarMenus] = useState<AppMenuItem[]>([]);
  const [dateRange, setDateRange] = useState<[Date, Date]>([undefined, undefined]);
  const [defaultTasks, setDefaultTasks] = useState<TaskListItem[]>([]);
  const [userInfo, setUserInfo] = useState<User>(undefined);
  const [smallWidth, setSmallWidth] = useState<boolean>(false);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState<boolean>(false);
  const [notificationsDrawerVisible, setNotificationsDrawerVisible] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationInfo[]>([]);
  const [defaultTasksLoading, setDefaultTasksLoading] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);

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

  const fetchDefaultTasks = () => {
    setDefaultTasksLoading(true);
    getTaskListFromTask('default', 6).then(res => {
      setDefaultTasks(res);
    }).finally(() => setDefaultTasksLoading(false));
  };

  const handleDeleteDefaultTask = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    task: TaskListItem,
  ) => {
    event.preventDefault();
    bus.emit('push', { action: 'DELETE', payloads: [task] });
  };

  const handleAddDefaultTask = (content: string | number) => {
    const taskContent = (typeof content === 'number') ? content.toString() : content;
    bus.emit('push', {
      action: 'ADD',
      payloads: [
        {
          taskId: idGen(),
          content: taskContent,
          order: defaultTasks.length,
          deadline: moment().add(1, 'day').startOf('day').toISOString(),
          parentTaskId: 'default',
          finished: false,
        },
      ],
    });
    return true;
  };

  useEffect(() => {
    const { id = '' } = parseParams(window.location.href, '/home/list/:id');
    if (id === '') {
      setCurrentActiveTaskIds([]);
    } else {
      setCurrentActiveTaskIds([id]);
    }
  }, [props.location]);

  useEffect(() => {
    const handler = () => {
      const innerWidth = window.innerWidth;
      setSmallWidth(innerWidth < 720);
    };
    window.addEventListener('resize', handler);
    return () => {
      window.removeEventListener('resize', handler);
    };
  }, []);

  useEffect(() => setSmallWidth(window.innerWidth < 720), []);

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

    const pushHandler = (dispatch: Dispatch) => {
      if (dispatch.payloads.length === 0) { return }
      switch (dispatch.action) {
      case 'ADD': {
        const tasksToBeAdded = Array
          .from(dispatch.payloads)
          .filter(payload => payload.parentTaskId === 'default')
          .map((task, index) => ({
            ...task,
            order: defaultTasks.length + index,
          }));
        bus.emit('dispatch', { action: 'ADD', payloads: tasksToBeAdded });
        setDefaultTasks(Array.from(defaultTasks).concat(tasksToBeAdded));
        break;
      }
      case 'DELETE': {
        const defaultTasksToBeDeleted: TaskListItem[] = [];
        const defaultTasksToBeUpdated: TaskListItem[] = [];
        const currentDefaultTasks: TaskListItem[] = [];
        defaultTasks.forEach(task => {
          if (dispatch.payloads.findIndex(payload => payload.taskId === task.taskId) === -1) {
            currentDefaultTasks.push(task);
          } else {
            defaultTasksToBeDeleted.push(task);
          }
        });
        currentDefaultTasks.forEach((task, index) => {
          if (task.order !== index) {
            const newTask = _merge(_cloneDeep(task), { order: index });
            defaultTasksToBeUpdated.push(newTask);
            return newTask;
          }
          return task;
        });
        setDefaultTasks(currentDefaultTasks);
        const { id = '' } = parseParams(window.location.href, '/home/list/:id');
        if (dispatch.payloads.findIndex(payload => payload.taskId === id) !== -1) {
          history.push('/home/list');
        }
        bus.emit('dispatch', { action: 'DELETE', payloads: defaultTasksToBeDeleted });
        bus.emit('dispatch', { action: 'UPDATE', payloads: defaultTasksToBeUpdated });
        break;
      }
      default:
        break;
      }
    };

    bus.on('push', pushHandler);
    bus.on('dispatch', dispatchHandler);

    return () => {
      bus.off('push', pushHandler);
      bus.off('dispatch', dispatchHandler);
    };
  }, [bus, dispatcher]);

  useEffect(() => {
    setIsDispatching(dispatcher.isDispatching);
  }, [dispatcher.isDispatching]);

  // TODO: Mock
  useEffect(() => {
    const today = moment().startOf('day').toDate();
    fetchDefaultTasks();
    setDateRange([today, today]);
    getUserInfo().then(res => {
      setUserInfo(res);
    });
    getAvatarMenu().then(res => setAvatarMenus(res));
    getNavMenu().then(res => setNavMenus(res));
  }, []);

  const generateSidebarContent = (): JSX.Element => (
    <>
      <div className="app-home__sidebar__header">
        {
          userInfo &&
          <PopupProvider
            className="popup-menu-wrapper"
            closeOnClick={true}
            disablePortal={true}
            trigger={
              <IconButton>
                <img className="avatar" src={userInfo.avatar} width="20" />
              </IconButton>
            }
          >
            <MenuList>
              {generatePopupMenu(avatarMenus)}
            </MenuList>
          </PopupProvider>
        }
        <div className="right-controls-wrapper"></div>
      </div>
      <div className="app-home__sidebar__input">
        <DebouncedTextField
          className="input"
          placeholder="键入 Enter 以新建任务清单..."
          onPressEnter={handleAddDefaultTask}
        />
      </div>
      <MenuList classes={{ root: 'app-home__sidebar__menu' }}>
        {
          defaultTasks.map((task, index) => {
            return <MenuItem classes={{ root: 'item' }} key={index}>
              <NavLink className="link" activeClassName="current" to={`/home/list/${task.taskId}`}>
                <ListIcon className="link__icon list" />
                <Typography noWrap={true} variant="caption">{task.content}</Typography>
                <CustomIconButton
                  className="link__icon delete"
                  type="delete" onClick={event => handleDeleteDefaultTask(event, task)}
                />
              </NavLink>
            </MenuItem>;
          })
        }
      </MenuList>
    </>
  );

  return (
    <ThemeProvider theme={theme}>
      <StylesProvider injectFirst={true}>
        <nav className={`app-home__nav${smallWidth ? ' small-width' : ''}`}>
          <div className="app-home__nav__left">
            <Drawer
              open={menuDrawerVisible}
              onClose={() => setMenuDrawerVisible(false)}
              trigger={() => (
                <IconButton
                  onClick={() => setMenuDrawerVisible(true)}
                >
                  <FormatIndentIncreaseIcon fontSize="small" />
                </IconButton>
              )}
              paperClass={{ elevation0: 'app-home__sidebar', elevation16: 'app-home__sidebar' }}
              stickyClass="sticky"
            >
              {generateSidebarContent()}
            </Drawer>
          </div>
          <div className="app-home__nav__center">
            {
              navMenus.length !== 0 &&
              <ButtonGroup classes={{ root: 'app-home__nav__pills' }} disableRipple={true}>
                {
                  navMenus.map((navMenu, index) => (
                    <Button key={index} className="app-button">
                      <NavLink className="nav-link" to={navMenu.path} activeClassName="active">
                        {navMenu.name}
                      </NavLink>
                    </Button>
                  ))
                }
              </ButtonGroup>
            }
            <DatePicker
              startDate={(dateRange && dateRange[0])}
              endDate={(dateRange && dateRange[1])}
              selectsRange={true}
              onConfirm={result => {
                if (Array.isArray(result)) {
                  const [start, end] = result;
                  setDateRange([start, end]);
                }
              }}
              customComponent={
                <Button variant="outlined" className="app-button" startIcon={<DateRangeIcon />} endIcon={<ExpandMoreIcon />}>
                  {generateDateString((dateRange && dateRange[0]), (dateRange && dateRange[1]))}
                </Button>
              }
            />
          </div>
          <div className="app-home__nav__right">
            <Drawer
              open={notificationsDrawerVisible}
              onClose={() => setNotificationsDrawerVisible(false)}
              trigger={() => (
                <IconButton
                  onClick={() => setNotificationsDrawerVisible(true)}
                >
                  <NotificationsIcon fontSize="small" />
                </IconButton>
              )}
              variant="temporary"
              anchor="right"
              paperClass={{
                elevation16: 'app-home__notifications',
              }}
            >
              <div className="app-home__notifications__header">
                <Typography variant="h6">通知</Typography>
              </div>
              {
                notifications.length === 0
                  ? <div className="app-home__notifications__content empty">
                    <img src="/assets/images/no_notifications.svg" alt="没有通知" className="illustrator" />
                    <h1>没有通知</h1>
                    <h2>最新的通知将会出现在这里</h2>
                  </div>
                  : <div className="app-home__notifications__content"></div>
              }
            </Drawer>
          </div>
        </nav>
        <div className="app-home__page">
          <Suspense fallback={<></>}>
            <Switch>
              <Route path="/home/list/:id">
                <ListPage
                  bus={bus}
                  currentActiveTaskIds={currentActiveTaskIds}
                  onSelectedTasksChange={handleSelectedTasksChange}
                  dateRange={[(dateRange && dateRange[0]), (dateRange && dateRange[1])]}
                  className={smallWidth ? 'small-width' : ''}
                />
              </Route>
              <Route path="/home/list">
                <ListPage
                  bus={bus}
                  currentActiveTaskIds={currentActiveTaskIds}
                  onSelectedTasksChange={handleSelectedTasksChange}
                  dateRange={[(dateRange && dateRange[0]), (dateRange && dateRange[1])]}
                  className={smallWidth ? 'small-width' : ''}
                />
              </Route>
              <Redirect from="/home" to="/home/list" />
            </Switch>
          </Suspense>
        </div>
      </StylesProvider>
    </ThemeProvider>
  );
};

export default Home;
