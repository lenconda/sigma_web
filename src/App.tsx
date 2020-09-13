import React, { useState } from 'react';
import { createMuiTheme, ThemeProvider } from '@material-ui/core';

import { TaskItem } from './components/TaskList/Item';
import TaskList from './components/TaskList';

const getItems = (count, offset = 0): TaskItem[] => Array.from({ length: count }, (v, k) => k).map(k => ({
  taskId: k.toString(),
  content: Math.random().toString(32),
  deadline: new Date().toISOString(),
  order: k,
  finished: false,
}));

const theme = createMuiTheme({
  props: {
    MuiButtonBase: {
      disableRipple: true,
    },
  },
  palette: {
    primary: {
      main: '#0052cc',
    },
    tonalOffset: 0.3,
  },
  typography: {
    fontSize: 12,
  },
});

const App: React.FC = () => {
  const [tasks, setTasks] = useState<TaskItem[]>(getItems(10));
  const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([]);

  return (
    <ThemeProvider theme={theme}>
      <TaskList
        tasks={tasks}
        selectedTasks={selectedTasks}
        listId={Math.random().toString(32).substring(2)}
        onCheckChange={(e, task) => {
          const currentTaskIndex = tasks.findIndex(value => value.taskId === task.taskId);
          tasks[currentTaskIndex].finished = e.target.checked;
          const newTasks = tasks.map(current => {
            if (current.taskId === task.taskId) {
              current.finished = e.target.checked;
            }
            return current;
          });
          setTasks(newTasks);
        }}
        onTasksChange={currentTasks => setTasks(currentTasks)}
        onSelectedTasksChange={currentSelectedTasks => setSelectedTasks(currentSelectedTasks)}
      />
    </ThemeProvider>
  );
};

export default App;
