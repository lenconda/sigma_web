/* eslint-disable max-nested-callbacks */
import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import Item, {
  TaskListItem,
} from '../TaskListItem';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
  DraggingStyle,
  NotDraggingStyle,
} from 'react-beautiful-dnd';
import {
  getDaysDifference,
} from '../../utils/date';
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
import Input from '@material-ui/core/Input';
import Hub from '../../core/hub';
import moment from 'moment';
import './index.less';
import IDGen from '../../core/idgen';

export interface Dispatch {
  action: 'UPDATE' | 'DELETE' | 'ADD';
  payload: TaskListItem[];
}

export interface TaskList {
  currentTask: TaskListItem;
  hub: Hub<Dispatch>;
  idGenerator: IDGen;
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

const reorder = (list: TaskListItem[], startIndex: number, endIndex: number): TaskListItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (draggableStyle: DraggingStyle | NotDraggingStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,
});

const getItems = (count: number): TaskListItem[] => Array.from({ length: count }, (v, k) => k).map(k => ({
  taskId: Math.random().toString(32),
  content: Math.random().toString(32),
  deadline: new Date().toISOString(),
  originalDeadline: new Date().toISOString(),
  order: k,
  finished: false,
  parentTaskId: '0',
}));

const generateStatus = (task: TaskListItem): JSX.Element => {
  const {
    originalDeadline,
    finished,
    finishedDate,
  } = task;
  const delayDays = getDaysDifference(
    (finished && finishedDate ? new Date(finishedDate) : new Date()),
    new Date(originalDeadline),
  );
  const status: '进行中' | '已完成' = finished ? '已完成' : '进行中';

  return (
    <Button
      size="small"
      startIcon={<AccessAlarmIcon fontSize="small" />}
    >
      <Typography
        color={delayDays > 0 ? 'error' : 'textPrimary'}
      >
        {`${status}${delayDays > 0 ? `，已过期 ${Math.abs(delayDays)} 天` : ''}`}
      </Typography>
    </Button>
  );
};

export default (props: TaskList) => {
  const {
    currentTask,
    hub,
    idGenerator,
  } = props;
  const taskListElement = useRef(null);
  const [multiple, setMultiple] = useState<boolean>(false);
  const [flag, setFlag] = useState<number>(0);
  const [addTaskInputVisible, setAddTaskInputVisible] = useState<boolean>(false);
  const [addTaskContent, setAddTaskContent] = useState<string>('');
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskListItem[]>([]);
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
    hub.emit('push', { action: 'UPDATE', payload: dispatchUpdateTasks });
    setTasks(currentTasks);
  };

  const handleSelectionChange = (task: TaskListItem) => {
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

  const handleCheckChange = (e: React.ChangeEvent<HTMLInputElement>, task: TaskListItem) => {
    const processCurrentTasks = (
      e: React.ChangeEvent<HTMLInputElement>,
      currentTask: TaskListItem,
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
    hub.emit('push', {
      action: 'UPDATE',
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
      hub.emit('push', { action: 'DELETE', payload: dispatchDeleteTasks });
      hub.emit('push', { action: 'UPDATE', payload: dispatchUpdateTasks });
      setTasks(newTasks);
      setSelectedTasks([]);
    }
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.keyCode === 13 || event.key.toLowerCase() === 'enter') {
      const deadline = moment().add(1, 'day').startOf('day').toISOString();
      const taskToBeAdded: TaskListItem = {
        content: addTaskContent,
        deadline,
        finished: false,
        order: tasks.length,
        originalDeadline: deadline,
        parentTaskId: currentTask.taskId,
        taskId: idGenerator.generate(),
      };
      hub.emit('push', { action: 'ADD', payload: [taskToBeAdded] });
      setAddTaskContent('');
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

  useEffect(() => {
    const hubHandler = (dispatch: Dispatch) => {
      switch (dispatch.action) {
      case 'ADD': {
        const tasksToBeAdded = [];
        dispatch.payload.forEach(payload => {
          if (payload.parentTaskId === currentTask.taskId) {
            payload.order = tasks[tasks.length - 1].order + 1;
            tasksToBeAdded.push(payload);
          }
        });
        setTasks(tasks.concat(tasksToBeAdded));
        hub.emit('dispatch', { action: 'ADD', payload: tasksToBeAdded });
        break;
      }
      case 'UPDATE': {
        const tasksToBeUpdated = [];
        const newTasks = tasks.map(task => {
          const payloadIndex =
            dispatch.payload.findIndex(payload => payload.taskId === task.taskId && payload.parentTaskId === currentTask.taskId);
          if (payloadIndex !== -1) {
            const currentNewTask = dispatch.payload[payloadIndex];
            tasksToBeUpdated.push(currentNewTask);
            return currentNewTask;
          } else {
            return task;
          }
        });
        setTasks(newTasks);
        hub.emit('dispatch', { action: 'UPDATE', payload: tasksToBeUpdated });
        break;
      }
      case 'DELETE': {
        const newTasks = tasks.filter(task => dispatch.payload.findIndex(payload => payload.taskId === task.taskId
                && payload.parentTaskId === currentTask.taskId) === -1);
        setTasks(newTasks);
        hub.emit('dispatch', { action: 'DELETE', payload: dispatch.payload });
        break;
      }
      default:
        break;
      }
    };
    hub.on('push', hubHandler);
    return () => {
      hub.off('push', hubHandler);
    };
  }, [tasks, idGenerator]);

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
        {generateStatus(currentTask)}
      </div>
      <List className={theme.root} ref={taskListElement}>
        <DragDropContext onDragEnd={handleDragEnd}>
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
                  {provided.placeholder}
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
          <AddCircleIcon fontSize="small" color={addTaskInputVisible ? 'primary' : 'inherit'} />
        </IconButton>
        {
          addTaskInputVisible &&
            <Input
              value={addTaskContent}
              placeholder="键入 Enter 以添加新任务..."
              className="task-topic"
              onChange={event => setAddTaskContent(event.target.value)}
              onKeyUp={handleInputKeyPress}
            />
        }
      </div>
      <div className="task-list__log-wrapper">
        <textarea placeholder="在这里写下任务描述..."></textarea>
      </div>
    </div>
  );
};
