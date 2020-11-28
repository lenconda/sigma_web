import React, {
  useEffect,
  useState,
  Suspense,
  lazy,
} from 'react';
import Bus from '../../core/bus';
import {
  Dispatch,
  Collection,
} from '../../components/TaskList';
import {
  TaskListItem,
  User,
} from '../../components/TaskListItem';
import {
  Route,
  Switch,
  Link,
  Redirect,
} from 'react-router-dom';
import PopupProvider from '../../components/PopupProvider';
import Button from '@material-ui/core/Button';
import DatePicker from '../../components/DatePicker';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import DateRangeIcon from '@material-ui/icons/DateRange';
import IconButton from '@material-ui/core/IconButton';
import Sticky from '../../components/Sticky';
import FormatListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import Typography from '@material-ui/core/Typography';
import moment from 'moment';
import {
  getUserInfo,
} from '../../services/user';
import {
  getCollections,
} from '../../services/collection';
import { history } from '../../App';
import DebouncedTextField from '../../components/DebouncedTextField';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import {
  parse,
  stringify,
} from '../../utils/location';
import {
  useUpdateEffect,
} from '../../core/hooks';
import Dispatcher from '../../core/dispatcher';
import './index.less';

const CollectionPage = lazy(() => import('./Collection'));

export interface AppMenu {
  name: string;
  path: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface HomePageProps {}

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

const Home: React.FC<HomePageProps> = () => {
  const bus = new Bus<Dispatch>();
  const dispatcher = new Dispatcher();
  const [currentActiveTaskIds, setCurrentActiveTaskIds] = useState<string[]>([]);
  const [menus, setMenus] = useState<Record<string, string>>({
    '/home/collection': '任务列表',
    '/home/summary': '摘要',
  });
  const [avatarMenus, setAvatarMenus] = useState<Record<string, string>>({
    '/home/profile': '账户设置',
    '/home/exit': '登出',
  });
  const [dateRange, setDateRange] = useState<DateRange>(undefined);
  const [userInfo, setUserInfo] = useState<User>(undefined);
  const [collections, setCollections] = useState<Collection[]>([]);

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
    setDateRange({
      start: today,
      end: today,
    });
    getUserInfo().then(res => setUserInfo(res));
    getCollections(6).then(res => setCollections(res));
  }, []);

  useEffect(() => {
    const { search } = parse(history.location);
    const { id = '' } = search;
    setCurrentActiveTaskIds((id ? [id] : []));
  }, [history.location.search]);

  return (
    <div className="app-home-page">
      <Sticky direction="horizontal" className="app-sidebar">
        <>
          <div className="app-sidebar__header">
            <div className="avatar_wrapper">
              <PopupProvider
                closeOnClick={true}
                trigger={
                  <IconButton>
                    <img src={(userInfo && userInfo.avatar) || '/assets/images/default_avatar.jpg'} />
                  </IconButton>
                }
              >
                <MenuList>
                  {generatePopupMenu(avatarMenus)}
                </MenuList>
              </PopupProvider>
            </div>
          </div>
          <div className="app-sidebar__add-collection-wrapper">
            <DebouncedTextField
              className="add-collection"
              onPressEnter={content => {
                console.log(content);
                return true;
              }}
              placeholder="键入 Enter 以添加新的清单..."
            />
          </div>
          <div className="app-sidebar__collections-wrapper">
            <MenuList>
              {
                collections.map((collection, index) => {
                  return <div
                    key={index}
                    onClick={() => {
                      const newLocation = _merge(parse(_cloneDeep(history.location)), { search: { id: collection.collectionId }});
                      history.push(stringify(newLocation));
                    }}
                  >
                    <MenuItem className="collection-item">
                      <FormatListBulletedIcon classes={{ root: 'icon' }} />
                      <Typography variant="inherit" noWrap={true}>{collection.name}</Typography>
                    </MenuItem>
                  </div>;
                })
              }
            </MenuList>
          </div>
        </>
      </Sticky>
      <nav className="app-nav">
        <PopupProvider
          closeOnClick={true}
          trigger={
            <Button variant="outlined" endIcon={<ExpandMoreIcon />}>
              {menus[history.location.pathname.split('/').slice(0, 3).join('/')]}
            </Button>
          }
        >
          <MenuList>
            {generatePopupMenu(menus)}
          </MenuList>
        </PopupProvider>
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
            <Button startIcon={<DateRangeIcon />} endIcon={<ExpandMoreIcon />} variant="outlined">
              {generateDateString((dateRange && dateRange.start), (dateRange && dateRange.end))}
            </Button>
          }
        />
      </nav>
      <div className="app-page">
        <Suspense fallback={<></>}>
          <Switch>
            <Route
              path="/home/collection"
              component={() => (
                <CollectionPage
                  bus={bus}
                  currentActiveTaskIds={currentActiveTaskIds}
                  onSelectedTasksChange={handleSelectedTasksChange}
                />
              )}
            />
            <Redirect to="/home/collection" />
          </Switch>
        </Suspense>
      </div>
    </div>
  );
};

export default Home;
