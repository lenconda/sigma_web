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

export interface HomePageProps {
  bus: Bus<Dispatch>;
  currentActiveTaskIds: string[];
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
  onSelectCollectionIds: (ids: string[]) => void;
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

const Home: React.FC<HomePageProps> = ({
  bus,
  currentActiveTaskIds,
  onSelectedTasksChange,
  onSelectCollectionIds,
}) => {
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

  // TODO: Mock
  useEffect(() => {
    console.log(111);
    const today = moment().startOf('day').toDate();
    setDateRange({
      start: today,
      end: today,
    });
    getUserInfo().then(res => setUserInfo(res));
    getCollections(6).then(res => setCollections(res));
  }, []);

  useUpdateEffect(() => {
    const { search } = parse(history.location);
    const { id = '' } = search;
    onSelectCollectionIds((id ? [id] : []));
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
                  onSelectedTasksChange={onSelectedTasksChange}
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
