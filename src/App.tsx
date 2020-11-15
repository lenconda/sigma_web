import React, { useEffect, useState } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Hub from './core/hub';
import IDGen from './core/idgen';
import { TaskListItem } from './components/TaskListItem';
import TaskList, { Dispatch } from './components/TaskList';

const getItems = (count: number): TaskListItem[] => Array.from({ length: count }, (v, k) => k).map(k => ({
  taskId: k.toString(),
  content: Math.random().toString(32),
  deadline: new Date().toISOString(),
  originalDeadline: new Date().toISOString(),
  order: k,
  finished: false,
  parentTaskId: Math.floor(Math.random() * 10).toString(),
}));

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      main: '#03a9f4',
    },
    tonalOffset: 0.3,
  },
  typography: {
    fontSize: 12,
  },
});

const App: React.FC = () => {
  const hub = new Hub<Dispatch>();
  const [idGen, setIdGen] = useState<IDGen | undefined>(undefined);

  useEffect(() => {
    const idGenInstance = new IDGen();
    idGenInstance.load().then(() => {
      setIdGen(idGenInstance);
    });
  }, []);

  useEffect(() => {
    hub.on('dispatch', (dispatch: Dispatch) => {
      console.log(dispatch);
    });
  }, [hub]);

  return (
    <ThemeProvider theme={theme}>
      <TaskList
        hub={hub}
        currentTask={getItems(1)[0]}
        idGenerator={idGen}
      />
    </ThemeProvider>
  );
};

export default App;
