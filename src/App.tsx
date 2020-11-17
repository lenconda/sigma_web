import React, { useEffect, useState } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Hub from './core/hub';
import TaskList, { Dispatch } from './components/TaskList';

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

  useEffect(() => {
    hub.on('dispatch', (dispatch: Dispatch) => {
      console.log(dispatch);
    });
  }, [hub]);

  return (
    <ThemeProvider theme={theme}>
      <TaskList
        hub={hub}
        currentTaskId="0"
      />
    </ThemeProvider>
  );
};

export default App;
