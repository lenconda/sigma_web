import React, { useState, useEffect, useRef } from 'react';
import Item, { TaskItem } from './Item';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AccessAlarmIcon from '@material-ui/icons/AccessAlarm';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import DeleteSweepIcon from '@material-ui/icons/DeleteSweep';
import MoveToInboxIcon from '@material-ui/icons/MoveToInbox';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import Input from '@material-ui/core/Input';
import './index.less';

interface Dispatch {
  action: 'UPDATE' | 'DELETE' | 'ADD';
  type: 'TASKS' | 'SECTIONS';
  payload: TaskItem[] | any[];
}

interface TaskList {
  currentTask: TaskItem;
  onDispatch: (dispatch: Dispatch) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    flexShrink: 0,
    flexGrow: 0,
    boxSizing: 'border-box',
  },
}));

const reorder = (list: TaskItem[], startIndex, endIndex): TaskItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (draggableStyle: DraggingStyle | NotDraggingStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,
});

const getItems = (count: number): TaskItem[] => Array.from({ length: count }, (v, k) => k).map(k => ({
  taskId: k.toString(),
  content: Math.random().toString(32),
  deadline: new Date().toISOString(),
  originalDeadline: new Date().toISOString(),
  order: k,
  finished: false,
  parentTaskId: Math.floor(Math.random() * 10).toString(),
}));

// const generateStatus: React.FC = (task: TaskItem) => {
//   const {
//     deadline,
//     originalDeadline,
//     finished,
//   } = task;
//   // const delayDays = d
//   return (
//     <>
//       <Button
//         size="small"
//         startIcon={<AccessAlarmIcon fontSize="small" />}
//       >
//         19:20
//       </Button>
//     </>
//   );
// };

export default (props: TaskList) => {
  const {
    currentTask,
    onDispatch,
  } = props;
  const taskListElement = useRef(null);
  const [multiple, setMultiple] = useState<boolean>(false);
  const [flag, setFlag] = useState<number>(0);
  const [addTaskInputVisible, setAddTaskInputVisible] = useState<boolean>(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([]);
  const theme = useStyles();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const currentTasks = reorder(tasks, source.index, destination.index);
    const dispatchUpdateTasks = [];
    currentTasks.forEach((currentTask, index) => {
      if (currentTask.order !== index) {
        currentTask.order = index;
        dispatchUpdateTasks.push(currentTask);
      }
    });
    onDispatch({ action: 'UPDATE', type: 'TASKS', payload: dispatchUpdateTasks });
    setTasks(currentTasks);
  };

  const handleSelectionChange = (task: TaskItem) => {
    const currentTaskIndex = selectedTasks.findIndex(currentTask => currentTask.taskId === task.taskId);
    let newSelectedTasks = [];
    if (multiple) {
      if (currentTaskIndex === -1) {
        setSelectedTasks(selectedTasks.concat(task));
      } else {
        newSelectedTasks = selectedTasks.slice(0, currentTaskIndex).concat(selectedTasks.slice(currentTaskIndex + 1));
        setSelectedTasks(newSelectedTasks);
      }
    } else {
      setSelectedTasks([task]);
    }
  };

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>, task: TaskItem) => {
    const processCurrentTasks = (
      e: React.ChangeEvent<HTMLInputElement>,
      currentTask: TaskItem,
    ) => {
      if (currentTask.taskId === task.taskId && e.target.checked !== currentTask.finished) {
        const currentFinishedTask = {
          ...currentTask,
          finished: e.target.checked,
        };
        return currentFinishedTask;
      }
      return currentTask;
    };
    const checkChangeTaskIndex = tasks.findIndex(currentTask => currentTask.taskId === task.taskId);
    const checkChangeTask = tasks[checkChangeTaskIndex];
    checkChangeTask.finished = e.target.checked;
    onDispatch({
      action: 'UPDATE',
      type: 'TASKS',
      payload: [checkChangeTask],
    });
    const newSelectedTasks = selectedTasks.map(currentTask => processCurrentTasks(e, currentTask));
    setSelectedTasks(newSelectedTasks);
    const currentTaskIndex = tasks.findIndex(value => value.taskId === task.taskId);
    tasks[currentTaskIndex].finished = e.target.checked;
    const newTasks = tasks.map(current => {
      if (current.taskId === task.taskId) {
        current.finished = e.target.checked;
      }
      return current;
    });
    setTasks(newTasks);
  };

  const handleDeleteTasks = () => {
    if (selectedTasks.length > 0) {
      const dispatchUpdateTasks = [];
      const dispatchDeleteTasks = Array.from(selectedTasks);
      const newTasks = Array.from(tasks)
        .filter(currentTask => selectedTasks.findIndex(currentTask1 => currentTask1.taskId === currentTask.taskId) === -1)
        .map((currentTask, index) => {
          if (currentTask.order !== index) {
            currentTask.order = index;
            dispatchUpdateTasks.push(currentTask);
          }
          return currentTask;
        });
      onDispatch({ action: 'DELETE', type: 'TASKS', payload: dispatchDeleteTasks });
      onDispatch({ action: 'UPDATE', type: 'TASKS', payload: dispatchUpdateTasks });
      setTasks(newTasks);
      setSelectedTasks([]);
    }
  };

  useEffect(() => {
    const handleMetaKey = (type: 'keydown' | 'keyup' | string, event: KeyboardEvent) => {
      const { metaKey, ctrlKey, key } = event;
      if (key === 'Backspace') {
        if (type === 'keydown') {
          setFlag(flag + 1);
        }
        if (type === 'keyup') {
          setFlag(flag - 1);
          handleDeleteTasks();
        }
      }
      if (metaKey || ctrlKey || key === 'Meta' || key === 'Control') {
        if (type === 'keydown') {
          setMultiple(true);
        } else if (type === 'keyup') {
          setMultiple(false);
        }
      }
    };
    const metaKeyEventHandler = (event: KeyboardEvent) => handleMetaKey(event.type, event);
    window.addEventListener('keydown', metaKeyEventHandler);
    window.addEventListener('keyup', metaKeyEventHandler);
    return () => {
      window.removeEventListener('keydown', metaKeyEventHandler);
      window.removeEventListener('keyup', metaKeyEventHandler);
    };
  }, [taskListElement, flag]);

  useEffect(() => {
    setTasks(getItems(10));
  }, []);

  return (
    <div className="task-list">
      <div className="task-list__title-bar">
        <Typography variant="h6">
          {props.currentTask.content}&nbsp;
          <IconButton aria-label="edit" size="medium">
            <EditIcon fontSize="small" />
          </IconButton>
        </Typography>
        <div className="task-list__log-wrapper__controls">
          <IconButton aria-label="edit" size="medium">
            <DeleteSweepIcon fontSize="small" />
          </IconButton>
        </div>
      </div>
      <div className="task-list__deadline">
      </div>
      <List className={theme.root} ref={taskListElement}>
        <DragDropContext
          onDragEnd={handleDragEnd}
          onBeforeDragStart={() => {
            const currentClientHeight =
              taskListElement.current.style.height
              || taskListElement.current.clientHeight
              || 0;
            taskListElement.current.style.height = `${currentClientHeight}px`;
          }}
        >
          <Droppable droppableId={props.currentTask.taskId}>
            {
              (provided, snapshot) => (
                <div ref={provided.innerRef}>
                  {
                    tasks.map((item, index) => (
                      <Draggable key={item.taskId} draggableId={item.taskId} index={index}>
                        {
                          (provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              style={getItemStyle(provided.draggableProps.style)}
                            >
                              <Item
                                selected={selectedTasks.findIndex(currentTask => item.taskId === currentTask.taskId) !== -1}
                                isDragging={snapshot.isDragging}
                                content={item.content}
                                taskId={item.taskId}
                                order={item.order}
                                deadline={item.deadline}
                                originalDeadline={item.originalDeadline}
                                finished={item.finished}
                                onSelectionChange={handleSelectionChange}
                                onCheckChange={handleCheckChange}
                                parentTaskId={item.parentTaskId}
                              />
                            </div>
                          )
                        }
                      </Draggable>
                    ))
                  }
                </div>
              )
            }
          </Droppable>
        </DragDropContext>
      </List>
      <div className="task-list__buttons">
        <IconButton
          size="medium"
          aria-label="delete"
          disabled={selectedTasks.length === 0}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="medium"
          aria-label="delete"
          disabled={selectedTasks.length === 0}
        >
          <MoveToInboxIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="medium"
          aria-label="add"
          onClick={() => setAddTaskInputVisible(!addTaskInputVisible)}
        >
          {
            !addTaskInputVisible
              ? <AddCircleIcon fontSize="small" />
              : <RemoveCircleIcon fontSize="small" color="primary" />
          }
        </IconButton>
        {
          addTaskInputVisible && <Input placeholder="键入 Enter 以添加新任务..." className="task-topic" />
        }
      </div>
      <div className="task-list__log-wrapper">
        <textarea placeholder="在这里写下任务描述..."></textarea>
      </div>
    </div>
  );
};
