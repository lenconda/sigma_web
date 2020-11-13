import React from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Hub from './core/hub';

import { TaskItem } from './components/TaskList/Item';
import TaskList from './components/TaskList';

const getItems = (count: number): TaskItem[] => Array.from({ length: count }, (v, k) => k).map(k => ({
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
  const hub = new Hub();
  return (
    <ThemeProvider theme={theme}>
      <TaskList
        currentTask={getItems(1)[0]}
        onDispatch={dispatch => console.log(dispatch)}
      />
    </ThemeProvider>
  );
};

export default App;
