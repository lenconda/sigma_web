import React, {
  useEffect,
  useState,
  Suspense,
  lazy,
} from 'react';
import Dispatcher from '../../core/dispatcher';
import {
  Route,
  Redirect,
  Link,
  NavLink,
  useLocation,
  useHistory,
} from 'react-router-dom';
import PopupProvider from '../../components/PopupProvider';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import DatePicker from '../../components/DatePicker';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import DebouncedTextField from '../../components/DebouncedTextField';
import moment from 'moment';
import idGen from '../../core/idgen';
import {
  updateSearch,
  deleteSearch,
  parseSearch,
} from '../../utils/url';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import { getTaskListFromTask } from '../../services/task';
import { getUserInfo } from '../../services/user';
import {
  getNavMenu,
  getAvatarMenu,
} from '../../services/menus';
import {
  ListIcon,
  CalendarIcon,
  ArrowDownIcon,
} from '../../core/icons';
import { useId } from '../../core/hooks';
import CustomIconButton from '../../components/IconButton';
import { AvatarImage } from '../../components/Image';
import Drawer from '../../components/Drawer';
import NotificationItem from '../../components/NotificationItem';
import {
  AppMenuItem,
  TaskListItem,
  Dispatch,
} from '../../interfaces';
import { HomePageProps } from '../../interfaces/pages/home';
import { ConnectState } from '../../interfaces/models';
import { connect } from 'dva';
import './index.less';

const ListPage = lazy(() => import('./List'));
const SummaryPage = lazy(() => import('./Summary'));

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

const Home: React.FC<HomePageProps> = ({
  dispatch: modelDispatch,
  profile: userInfo,
  notifications,
  hasMoreNotifications,
  notificationPagination,
  fetchNotificationsLoading: notificationsLoading,
  dateRange,
  currentActiveTaskIds,
  bus,
  smallWidth,
}) => {
  const dispatcher = new Dispatcher();
  const [navMenus, setNavMenus] = useState<AppMenuItem[]>([]);
  const [avatarMenus, setAvatarMenus] = useState<AppMenuItem[]>([]);
  const [defaultTasks, setDefaultTasks] = useState<TaskListItem[]>([]);
  const [menuDrawerVisible, setMenuDrawerVisible] = useState<boolean>(false);
  const [notificationsDrawerVisible, setNotificationsDrawerVisible] = useState<boolean>(false);
  const [defaultTasksLoading, setDefaultTasksLoading] = useState<boolean>(false);
  const [isDispatching, setIsDispatching] = useState<boolean>(false);
  const location = useLocation();
  const history = useHistory();
  const currentId = useId(location);
  const dispatchStatus = dispatcher.useDispatchStatus();

  const fetchDefaultTasks = () => {
    setDefaultTasksLoading(true);
    getTaskListFromTask('default', 6).then(res => {
      setDefaultTasks(res);
    }).finally(() => setDefaultTasksLoading(false));
  };

  const handleNotificationItemClick = (event: React.MouseEvent<HTMLElement, MouseEvent>, index: number) => {
    const currentNotificationItems = Array.from(notifications);
    currentNotificationItems.splice(index, 1, {
      ...notifications[index],
      checked: true,
    });
    modelDispatch({
      type: 'global/setNotifications',
      payload: currentNotificationItems,
    });
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
    modelDispatch({
      type: 'global/setCurrentActiveTaskIds',
      payload: currentId === '' ? [] : [currentId],
    });
  }, [currentId]);

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
              modelDispatch({
                type: 'global/setCurrentActiveTaskIds',
                payload: currentActiveTaskIds.slice(0, payloadActiveIndex),
              });
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
        if (tasksToBeAdded.length !== 0) {
          bus.emit('dispatch', { action: 'ADD', payloads: tasksToBeAdded });
          setDefaultTasks(Array.from(defaultTasks).concat(tasksToBeAdded));
        }
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
        if (dispatch.payloads.findIndex(payload => payload.taskId === currentId) !== -1) {
          history.push({
            ...location,
            pathname: location.pathname,
            search: deleteSearch(location.search, ['id']),
          });
          bus.emit('dispatch', { action: 'DELETE', payloads: defaultTasksToBeDeleted });
          bus.emit('dispatch', { action: 'UPDATE', payloads: defaultTasksToBeUpdated });
        }
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
    setIsDispatching(dispatchStatus);
  }, [dispatchStatus]);

  // TODO: Mock
  useEffect(() => {
    fetchDefaultTasks();
    getUserInfo().then(res => {
      modelDispatch({
        type: 'global/setProfile',
        payload: res,
      });
    });
    getAvatarMenu().then(res => setAvatarMenus(res));
    getNavMenu().then(res => setNavMenus(res));
  }, []);

  useEffect(() => {
    if (defaultTasks.findIndex(defaultTask => defaultTask.taskId === currentId) === -1) {
      history.push({
        ...location,
        search: deleteSearch(location.search, ['id']),
      });
    }
  }, [defaultTasks, currentId]);

  useEffect(() => {
    const { date = '', templateId = '' } = parseSearch(location.search);
    if (date) {
      const [startTimestamp, endTimestamp] = date.split('_');
      modelDispatch({
        type: 'global/setDateRange',
        payload: [new Date(parseInt(startTimestamp, 10)), new Date(parseInt(endTimestamp, 10))],
      });
    }
    if (templateId) {
      modelDispatch({
        type: 'global/setCurrentTemplateId',
        payload: templateId,
      });
    }
  }, [location.search]);

  return (
    <>
      <nav className={`app-home__nav${smallWidth ? ' small-width' : ''}`}>
        <div className="app-home__nav__left">
          <Drawer
            open={menuDrawerVisible}
            onClose={() => setMenuDrawerVisible(false)}
            trigger={() => (
              <CustomIconButton
                size={20}
                type="list-expand"
                onClick={() => setMenuDrawerVisible(true)}
              />
            )}
            paperClass={{ elevation0: 'app-home__sidebar', elevation16: 'app-home__sidebar' }}
            stickyClass="sticky"
          >
            <div className="app-home__sidebar__header">
              {
                userInfo &&
                <PopupProvider
                  className="popup-menu-wrapper"
                  closeOnClick={true}
                  disablePortal={true}
                  closeOnClickSelf={true}
                  trigger={
                    <IconButton>
                      <AvatarImage className="avatar" src={userInfo.avatar} width="20" />
                    </IconButton>
                  }
                >
                  <MenuList>
                    {generatePopupMenu(avatarMenus)}
                  </MenuList>
                </PopupProvider>
              }
              <div className="right-controls-wrapper">
                <CustomIconButton
                  size={18}
                  className="button"
                  type="refresh"
                  disabled={defaultTasksLoading || isDispatching}
                  spin={defaultTasksLoading || isDispatching}
                  onClick={fetchDefaultTasks}
                />
              </div>
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
                  return <MenuItem
                    key={index}
                    classes={{ gutters: 'item' }}
                  >
                    <div
                      className={`content${currentActiveTaskIds[0] === task.taskId ? ' current' : ''}`}
                      onClick={() => {
                        history.push({
                          ...location,
                          search: updateSearch(location.search, { id: task.taskId }),
                        });
                      }}
                    >
                      <ListIcon className="content__icon list" />
                      <Typography noWrap={true}>{task.content}</Typography>
                      <CustomIconButton
                        className="content__icon delete"
                        type="delete"
                        onClick={event => {
                          event.stopPropagation();
                          handleDeleteDefaultTask(event, task);
                        }}
                      />
                    </div>
                  </MenuItem>;
                })
              }
            </MenuList>
          </Drawer>
        </div>
        <div className="app-home__nav__center">
          {
            navMenus.length !== 0 &&
            <ButtonGroup classes={{ root: 'app-home__nav__pills' }} disableRipple={true}>
              {
                navMenus.map((navMenu, index) => (
                  <Button key={index} className="app-button">
                    <NavLink
                      className="nav-link"
                      to={{
                        ...location,
                        pathname: navMenu.path,
                      }}
                      activeClassName="active"
                    >
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
                const dateRangeSearch = [start.getTime(), end.getTime()].join('_');
                history.push({
                  ...location,
                  search: updateSearch(location.search, { date: dateRangeSearch }),
                });
              }
            }}
            customComponent={
              <Button
                className="app-button nav-button"
                startIcon={<CalendarIcon />}
                endIcon={<ArrowDownIcon fontSize={12} />}
              >
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
              <CustomIconButton
                type="notification-bordered"
                size={20}
                onClick={() => setNotificationsDrawerVisible(true)}
              />
            )}
            variant="temporary"
            anchor="right"
            paperClass={{
              elevation16: 'app-home__notifications',
            }}
          >
            <div className="app-home__notifications__header">
              <Typography variant="h6">{notificationsLoading ? '请稍候...' : '通知'}</Typography>
            </div>
            {
              notifications.length === 0
                ? <div className="app-home__notifications__content empty">
                  <img src="/assets/images/no_notifications.svg" alt="没有通知" className="illustrator" />
                  <h1>没有通知</h1>
                  <h2>最新的通知将会出现在这里</h2>
                </div>
                : <div className="app-home__notifications__content">
                  {
                    notifications.map((notification, index) => (
                      <NotificationItem
                        key={index}
                        notification={notification}
                        onClick={event => handleNotificationItemClick(event, index)}
                      />
                    ))
                  }
                  <Button
                    disabled={notificationsLoading}
                    onClick={() => {
                      const {
                        current,
                        size,
                      } = notificationPagination;
                      modelDispatch({
                        type: 'global/fetchNotifications',
                        payload: {
                          current: current + 1,
                          size,
                        },
                      });
                    }}
                  >
                    {
                      notificationsLoading
                        ? '加载中...'
                        : hasMoreNotifications
                          ? '加载更多'
                          : '暂无更多通知'
                    }
                  </Button>
                </div>
            }
          </Drawer>
        </div>
      </nav>
      <div className={`app-home__page${smallWidth ? ' small-width' : ''}`}>
        <Suspense fallback={<></>}>
          <Route path="/home/list" component={ListPage} />
          <Route path="/home/summary" component={SummaryPage} />
          <Redirect from="/home" to="/home/list" />
        </Suspense>
      </div>
    </>
  );
};

export default connect(({ global }: ConnectState) => global)(Home);
