import React, { useEffect } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';
import Bus from './core/bus';
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

  useEffect(() => {
    bus.on('dispatch', (dispatch: Dispatch) => {
      console.log(dispatch);
    });
  }, [bus]);

  return (
    <ThemeProvider theme={theme}>
      <TaskList bus={bus} currentTaskId="0" />
    </ThemeProvider>
  );
};

export default App;
