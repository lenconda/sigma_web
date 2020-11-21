import React, { useEffect } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Bus from './core/bus';
import Dispatcher from './core/dispatcher';
import TaskList, { Dispatch } from './components/TaskList';

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

  useEffect(() => {
    dispatcher.start();
    bus.on('dispatch', (dispatch: Dispatch) => {
      if (dispatch.payloads.length !== 0) {
        dispatcher.enqueue(dispatch);
      }
    });
    return () => {
      dispatcher.stop();
    };
  }, [bus, dispatcher]);

  return (
    <ThemeProvider theme={theme}>
      <TaskList bus={bus} currentTaskId="0" />
    </ThemeProvider>
  );
};

export default App;
