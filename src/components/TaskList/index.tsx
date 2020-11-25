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
import Bus from '../../core/bus';
import moment from 'moment';
import './index.less';
import {
  useDebouncedValue,
  useUpdateEffect,
} from '../../core/hooks';
import idGen from '../../core/idgen';
import TaskSelector from '../TaskSelector';
import DatePicker from '../DatePicker';
import {
  getTaskInfo,
  getTaskListFromTask,
} from '../../services/task';
import EditableField from '../EditableField';
import { ProgressIcon } from '../../core/icons';
import IconButton from '../IconButton';

export interface Dispatch {
  action: 'UPDATE' | 'DELETE' | 'ADD';
  payloads: TaskListItem[];
}

export interface TaskList {
  currentTaskId: string;
  bus: Bus<Dispatch>;
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
  currentActiveTaskIds?: string[];
  isDefault?: boolean;
}

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    padding: 0,
    boxShadow: '0 5px 15px 2.5px rgba(0, 0, 0, .03)',
    borderRadius: 6,
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
  },
}));

const reorder = (list: TaskListItem[], startIndex: number, endIndex: number): TaskListItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (draggableStyle: DraggingStyle | NotDraggingStyle) => ({
  ...draggableStyle,
});

const generateStatus = (task: TaskListItem): JSX.Element => {
  if (!task) {
    return null;
  }
  const {
    deadline,
    finished,
    finishedDate,
  } = task;
  const delayDays = getDaysDifference(
    (finished && finishedDate ? new Date(finishedDate) : new Date()),
    new Date(deadline),
  );
  const status: '进行中' | '已完成' = finished ? '已完成' : '进行中';
  const deadlineDate = new Date(deadline);
  const [year, month, date] = [
    deadlineDate.getFullYear(),
    deadlineDate.getMonth() + 1,
    deadlineDate.getDate(),
  ];

  return (
    <Button size="small" startIcon={<ProgressIcon />}>
      <Typography color="textSecondary" variant="button">
        {year}-{month}-{date}
      </Typography>
      &nbsp;
      <Typography color={delayDays > 0 ? 'error' : 'textSecondary'} variant="button">
        {`${status}${delayDays > 0 ? `，已过期 ${Math.abs(delayDays)} 天` : ''}`}
      </Typography>
    </Button>
  );
};

export default (props: TaskList) => {
  const {
    currentTaskId,
    bus,
    currentActiveTaskIds = [],
    onSelectedTasksChange,
    isDefault = false,
  } = props;
  const taskListElement = useRef(null);
  const [multiple, setMultiple] = useState<boolean>(false);
  const [addTaskContent, setAddTaskContent] = useState<string>('');
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskListItem[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskListItem | undefined>(undefined);
  const [currentTaskContent, setCurrentTaskContent] = useState<string>('');
  const debouncedCurrentTaskContent = useDebouncedValue(currentTaskContent, 500);
  const [currentTaskDescription, setCurrentTaskDescription] = useState<string>('');
  const debouncedCurrentTaskDescription = useDebouncedValue(currentTaskDescription, 500);
  const [taskSelectorVisible, setTaskSelectorVisible] = useState<boolean>(false);
  const [taskListLoading, setTaskListLoading] = useState<boolean>(false);
  const [currentTaskLoading, setCurrentTaskLoading] = useState<boolean>(false);
  const theme = useStyles();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const currentTasks = reorder(tasks, source.index, destination.index);
    const dispatchUpdateTasks = [];
    currentTasks.forEach((task, index) => {
      if (task.order !== index) {
        task.order = index;
        dispatchUpdateTasks.push(task);
      }
    });
    bus.emit('push', { action: 'UPDATE', payloads: dispatchUpdateTasks });
    setTasks(currentTasks);
  };

  const handleSelectionChange = (task: TaskListItem) => {
    const currentTaskIndex = selectedTasks.findIndex(currentTask => currentTask.taskId === task.taskId);
    let newSelectedTasks = [];
    if (multiple) {
      if (currentTaskIndex === -1) {
        newSelectedTasks = selectedTasks.concat(task);
      } else {
        newSelectedTasks = selectedTasks.slice(0, currentTaskIndex).concat(selectedTasks.slice(currentTaskIndex + 1));
      }
    } else {
      newSelectedTasks = [task];
    }
    setSelectedTasks(newSelectedTasks);
  };

  const handleDeleteTasks = () => {
    return new Promise(resolve => {
      if (selectedTasks.length > 0) {
        const dispatchDeleteTasks = Array.from(selectedTasks);
        bus.emit('push', { action: 'DELETE', payloads: dispatchDeleteTasks });
        resolve();
      } else {
        resolve();
      }
    });
  };

  const handleInputKeyPress = (event: React.KeyboardEvent<HTMLElement>) => {
    if ((event.keyCode === 13 || event.key.toLowerCase() === 'enter') && addTaskContent !== '') {
      const deadline = moment().add(1, 'day').startOf('day').toISOString();
      const taskToBeAdded: TaskListItem = {
        content: addTaskContent,
        deadline,
        finished: false,
        order: tasks.length,
        parentTaskId: currentTask.taskId,
        taskId: idGen(),
      };
      bus.emit('push', { action: 'ADD', payloads: [taskToBeAdded] });
      setAddTaskContent('');
    }
  };

  const handleCurrentTaskFinishedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newCurrentTaskInfo: TaskListItem = {
      ...currentTask,
      finished: event.target.checked,
      finishedDate: new Date().toISOString(),
    };
    bus.emit('push', { action: 'UPDATE', payloads: [newCurrentTaskInfo] });
  };

  const handleContentInputChange = (content: string) => {
    if (content || content === '') {
      bus.emit('push', {
        action: 'UPDATE',
        payloads: [{ ...currentTask, content: content || '未命名任务' }],
      });
    }
  };

  const handleDescriptionInputChange = (description: string) => {
    if (description || description === '') {
      bus.emit('push', {
        action: 'UPDATE',
        payloads: [{ ...currentTask, description }],
      });
    }
  };

  const handleMoveTasks = (newParentTask: TaskListItem) => {
    const currentSelectedTasks = Array.from(selectedTasks).map(task => ({
      ...task,
      parentTaskId: newParentTask.taskId,
    }));
    handleDeleteTasks().then(() => {
      bus.emit('push', { action: 'ADD', payloads: currentSelectedTasks });
    });
  };

  useEffect(() => {
    const handleMetaKey = (type: 'keydown' | 'keyup' | string, event: KeyboardEvent) => {
      const { metaKey, ctrlKey, key } = event;
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
  }, [taskListElement]);

  useEffect(() => {
    onSelectedTasksChange(selectedTasks);
  }, [selectedTasks]);

  useEffect(() => {
    // TODO: request current task info
    setCurrentTaskLoading(true);
    getTaskInfo(currentTaskId, currentActiveTaskIds[currentActiveTaskIds.length - 2], isDefault).then(currentTaskInfo => {
      setCurrentTask(currentTaskInfo);
      if (!isDefault) {
        // TODO: request sub-tasks info
        setTaskListLoading(true);
        getTaskListFromTask(currentTaskId, 10)
          .then(tasks => setTasks(tasks))
          .finally(() => setTaskListLoading(false));
      }
    }).finally(() => setCurrentTaskLoading(false));
  }, [currentTaskId]);

  useUpdateEffect(() => {
    handleContentInputChange(debouncedCurrentTaskContent);
  }, [debouncedCurrentTaskContent]);

  useUpdateEffect(() => {
    handleDescriptionInputChange(debouncedCurrentTaskDescription);
  }, [debouncedCurrentTaskDescription]);

  useEffect(() => {
    const handler = (dispatch: Dispatch) => {
      switch (dispatch.action) {
      case 'ADD': {
        const tasksToBeAdded = [];
        dispatch.payloads.forEach(payload => {
          if (payload.parentTaskId === (currentTask && currentTask.taskId)) {
            const lastTask = tasks[tasks.length - 1];
            payload.order = (lastTask && lastTask.order || 0) + 1;
            tasksToBeAdded.push(payload);
          }
        });
        setTasks(tasks.concat(tasksToBeAdded));
        bus.emit('dispatch', { action: 'ADD', payloads: tasksToBeAdded });
        break;
      }
      case 'UPDATE': {
        const tasksToBeUpdated = [];
        const newTasks = Array.from(tasks);
        let currentTaskInfo = { ...currentTask };
        dispatch.payloads.forEach(payload => {
          const currentTaskIndex = newTasks.findIndex(task => task.taskId === payload.taskId);
          if (payload.taskId === (currentTask && currentTask.taskId)) {
            currentTaskInfo = { ...payload };
            if (currentActiveTaskIds.indexOf(payload.parentTaskId) === -1) {
              tasksToBeUpdated.push(payload);
            }
          } else if (
            currentTaskIndex !== -1
            && payload.parentTaskId === (currentTask && currentTask.taskId)
          ) {
            tasksToBeUpdated.push(payload);
            newTasks.splice(currentTaskIndex, 1, payload);
          }
        });
        setTasks(newTasks);
        setCurrentTask(currentTaskInfo);
        if (tasksToBeUpdated.length > 0) {
          bus.emit('dispatch', { action: 'UPDATE', payloads: tasksToBeUpdated });
        }
        break;
      }
      case 'DELETE': {
        const dispatchUpdateTasks = [];
        const newTasks = tasks
          .filter(task => dispatch.payloads.findIndex(payload => payload.taskId === task.taskId) === -1);
        if (newTasks.length < tasks.length) {
          newTasks.forEach((currentTask, index) => {
            if (currentTask.order !== index) {
              currentTask.order = index;
              dispatchUpdateTasks.push(currentTask);
            }
          });
          bus.emit('dispatch', dispatch);
          bus.emit('push', { action: 'UPDATE', payloads: dispatchUpdateTasks });
        }
        const newSelectedTasks = Array
          .from(selectedTasks)
          .filter(task => {
            return dispatch.payloads.findIndex(payload => payload.taskId === task.taskId) === -1;
          });
        setSelectedTasks(newSelectedTasks);
        setTasks(newTasks);
        break;
      }
      default:
        break;
      }
    };
    bus.on('push', handler);
    return () => {
      bus.off('push', handler);
    };
  }, [tasks, currentTask, bus, selectedTasks, currentActiveTaskIds]);

  return (
    <div className="task-list">
      <div className="task-list__title-bar">
        <Typography variant="h6" className={theme.title}>
          {
            !isDefault
              ? <>
                <input
                  type="checkbox"
                  checked={(currentTask && currentTask.finished) || false}
                  onChange={handleCurrentTaskFinishedChange}
                />
                <EditableField
                  className="title-input"
                  content={(currentTask && currentTask.content)}
                  onChange={event => setCurrentTaskContent(event.target.value)}
                />
              </>
              : <>
                <div style={{ width: 10 }}></div>
                <div className="title-input">{(currentTask && currentTask.content)}</div>
              </>
          }
        </Typography>
        {
          !isDefault
          && <div className="task-list__log-wrapper__controls">
            <IconButton
              type="delete"
              onClick={() => bus.emit('push', { action: 'DELETE', payloads: [currentTask] })}
            />
          </div>
        }
      </div>
      {
        !isDefault
        && <div className="task-list__deadline">
          <DatePicker
            startDate={currentTask ? new Date(currentTask.deadline) : new Date()}
            customComponent={generateStatus(currentTask)}
            onChange={date => {
              if (date instanceof Date) {
                const newCurrentTaskInfo: TaskListItem = {
                  ...currentTask,
                  deadline: date.toISOString(),
                };
                bus.emit('push', { action: 'UPDATE', payloads: [newCurrentTaskInfo] });
              }
            }}
          />
        </div>
      }
      <div className="task-list__items-wrapper">
        {
          taskListLoading || currentTaskLoading
            ? <span className="loading">请求中...</span>
            : tasks.length !== 0
              ? <List className={theme.root} ref={taskListElement}>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={(currentTask && currentTask.taskId) || Math.random().toString(32).substr(2)}>
                    {
                      (provided, snapshot) => (
                        <div ref={provided.innerRef} className="task-items">
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
                                        className="task-item-wrapper"
                                        selected={selectedTasks.findIndex(currentTask => item.taskId === currentTask.taskId) !== -1}
                                        isDragging={snapshot.isDragging}
                                        content={item.content}
                                        taskId={item.taskId}
                                        order={item.order}
                                        deadline={item.deadline}
                                        finished={item.finished}
                                        onSelectionChange={handleSelectionChange}
                                        onChange={task => bus.emit('push', { action: 'UPDATE', payloads: [task] })}
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
              : <div className="no-content">
                <img src="/assets/images/no_tasks.svg" className="illustrator" />
                <div>
                  <h1>没有子任务</h1>
                  <h2>在下方输入任务内容以添加新的子任务</h2>
                </div>
              </div>
        }
      </div>
      <div className="task-list__buttons">
        <input
          value={addTaskContent}
          className="add-task-content"
          placeholder="键入 Enter 以添加新的子任务..."
          onChange={event => setAddTaskContent(event.target.value)}
          onKeyUp={handleInputKeyPress}
        />
        {
          selectedTasks.length !== 0 &&
            <>
              <IconButton
                type="move"
                style={{ marginLeft: 10 }}
                onClick={() => setTaskSelectorVisible(true)}
              />
              <IconButton
                type="delete"
                onClick={handleDeleteTasks}
              />
            </>
        }
      </div>
      {
        !isDefault
        && <div className="task-list__log-wrapper">
          <textarea
            placeholder="在这里写下任务描述..."
            defaultValue={(currentTask && currentTask.description) || ''}
            onChange={event => setCurrentTaskDescription(event.target.value)}
          ></textarea>
        </div>
      }
      <TaskSelector
        visible={taskSelectorVisible}
        onClose={() => setTaskSelectorVisible(false)}
        onSelectTask={handleMoveTasks}
      />
    </div>
  );
};

export const Empty: React.FC = () => (
  <div className="task-list empty">
    点击左侧任意一条子任务以查看任务详情
  </div>
);
