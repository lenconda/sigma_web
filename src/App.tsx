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
  Router,
  NavLink,
} from 'react-router-dom';
import idGen from './core/idgen';
import PopupProvider from './components/PopupProvider';
import Button from '@material-ui/core/Button';
import StickyNav from './components/StickyNav';
import DatePicker from './components/DatePicker';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { createBrowserHistory } from 'history';
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
        <Router history={history}>
          <StickyNav className="app-nav">
            <>
              <div className="app-nav__menus--left">
                <ButtonGroup>
                  {
                    Object.keys(menus).map((path, index) => {
                      return <Button key={index} className="nav-button">
                        <NavLink to={path} className="link" activeClassName="active" key={index}>{menus[path]}</NavLink>
                      </Button>;
                    })
                  }
                </ButtonGroup>
              </div>
              <div className="app-nav__menus--center">
                <DatePicker
                  selectsRange={true}
                  onConfirm={result => console.log(result)}
                  customComponent={<Button variant="outlined" endIcon={<ExpandMoreIcon />}>日期</Button>}
                />
              </div>
              <div className="app-nav__menus--right">
                <PopupProvider
                  trigger={
                    <Button>
                      <img src="/assets/images/default_avatar.svg" width="20" />
                    </Button>
                  }
                >
                  <MenuList>
                    {
                      Object.keys(avatarMenus).map((path, index) => {
                        return <NavLink to={path} className="link" key={index}>
                          <MenuItem>{avatarMenus[path]}</MenuItem>
                        </NavLink>;
                      })
                    }
                  </MenuList>
                </PopupProvider>
              </div>
            </>
          </StickyNav>
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
