/* eslint-disable max-nested-callbacks */
import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import Item, {
  TaskListItem,
  TaskListItemDetailInfo,
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
import idGen from '../../core/idgen';
import TaskSelector from '../TaskSelector';
import DatePicker from '../DatePicker';
import {
  getTaskListFromTask,
  getCurrentTaskInfo,
} from '../../services/task';
import { ProgressIcon } from '../../core/icons';
import IconButton from '../IconButton';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import {
  getTaskGenerateInfo,
} from '../../utils/task';
import Checkbox from '../Checkbox';
import DebouncedTextField from '../DebouncedTextField';
import './index.less';

export interface Dispatch {
  action: 'UPDATE' | 'DELETE' | 'ADD';
  payloads: TaskListItem[] | TaskListItemDetailInfo[];
}

export interface TaskList {
  currentTaskId: string;
  bus: Bus<Dispatch>;
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
  currentActiveTaskIds?: string[];
  isDefault?: boolean;
  dateRange: [Date, Date];
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
    return <></>;
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
  const deadlineDate = moment(new Date(deadline)).add(-1, 'day').startOf('day').toDate();
  const [year, month, date] = [
    deadlineDate.getFullYear(),
    deadlineDate.getMonth() + 1,
    deadlineDate.getDate(),
  ];

  return (
    <Button size="small" startIcon={<ProgressIcon style={{ color: '#aaa' }} />}>
      <Typography color="textSecondary" variant="body2">
        {year}-{month}-{date}
      </Typography>
      &nbsp;
      <Typography color={delayDays > 0 ? 'error' : 'textSecondary'} variant="body2">
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
    dateRange = [undefined, undefined],
  } = props;
  const taskListElement = useRef(null);
  const [multiple, setMultiple] = useState<boolean>(false);
  const [addTaskContent, setAddTaskContent] = useState<string>('');
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [shownTasks, setShownTasks] = useState<TaskListItem[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<TaskListItem[]>([]);
  const [currentTask, setCurrentTask] = useState<TaskListItemDetailInfo | undefined>(undefined);
  const [taskSelectorVisible, setTaskSelectorVisible] = useState<boolean>(false);
  const [taskListLoading, setTaskListLoading] = useState<boolean>(false);
  const [currentTaskLoading, setCurrentTaskLoading] = useState<boolean>(false);
  const [selectedDateRange, setSelectedDateRange] = useState<[Date, Date]>([undefined, undefined]);
  const theme = useStyles();

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination || !source) {
      return;
    }
    const sourceTask = shownTasks[source.index];
    const destinationTask = shownTasks[destination.index];
    const currentShownTasks = reorder(Array.from(shownTasks), source.index, destination.index);
    const sourceTaskIndex = tasks.findIndex(task => task.taskId === sourceTask.taskId);
    const destinationTaskIndex = tasks.findIndex(task => task.taskId === destinationTask.taskId);
    if (sourceTaskIndex !== -1 && destinationTaskIndex !== -1) {
      const dispatchUpdateTasks = [];
      const currentAllTasks = reorder(tasks, sourceTaskIndex, destinationTaskIndex);
      currentAllTasks.forEach((task, index) => {
        if (task.order !== index) {
          task.order = index;
          dispatchUpdateTasks.push(task);
        }
      });
      bus.emit('push', { action: 'UPDATE', payloads: dispatchUpdateTasks });
      setTasks(currentAllTasks);
    }
    setShownTasks(currentShownTasks);
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
    if (selectedTasks.length > 0) {
      const dispatchDeleteTasks = Array.from(selectedTasks);
      bus.emit('push', { action: 'DELETE', payloads: dispatchDeleteTasks });
    }
  };

  const handleAddTask = (content: string | number) => {
    if (typeof content === 'string' && content !== '') {
      const deadline = moment().add(1, 'day').startOf('day').toISOString();
      const taskToBeAdded: TaskListItem = {
        content,
        deadline,
        finished: false,
        order: tasks.length,
        parentTaskId: currentTask.taskId,
        taskId: idGen(),
      };
      bus.emit('push', { action: 'ADD', payloads: [taskToBeAdded] });
      setAddTaskContent('');
    }
    return true;
  };

  const handleUpdateCurrentTask = (updates: Partial<TaskListItemDetailInfo>) => {
    const newCurrentTaskInfo = _merge(_cloneDeep(currentTask), updates);
    bus.emit('push', { action: 'UPDATE', payloads: [newCurrentTaskInfo] });
  };

  const handleMoveTasks = (newParentTask: TaskListItem) => {
    console.log('move tasks');
    const currentSelectedTasks = Array.from(selectedTasks).map(task => ({
      ...task,
      parentTaskId: newParentTask.taskId,
    }));
    handleDeleteTasks();
    bus.emit('push', { action: 'ADD', payloads: currentSelectedTasks });
  };

  const handleFinishAllTasks = () => {
    const tasksToBeUpdated: TaskListItem[] = [
      ...Array.from(tasks).map(task => ({
        ...task,
        finished: true,
      })),
      { ...getTaskGenerateInfo((currentTask)), finished: true },
    ];
    bus.emit('push', { action: 'UPDATE', payloads: tasksToBeUpdated });
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
    const [start, end] = dateRange;
    const startDate = moment(start).startOf('day').toDate();
    const endDate = moment(end).add(1, 'day').toDate();
    setSelectedDateRange([startDate, endDate]);
  }, [dateRange, tasks]);

  useEffect(() => {
    const [startDate, endDate] = selectedDateRange;
    if (startDate && endDate) {
      setShownTasks(tasks.filter(task => {
        const taskDeadlineTimestamp = Date.parse(task.deadline);
        const startTimestamp = Date.parse(startDate.toISOString());
        const endTimeStamp = Date.parse(endDate.toISOString());
        return startTimestamp <= taskDeadlineTimestamp && endTimeStamp >= taskDeadlineTimestamp;
      }));
    }
  }, [selectedDateRange, tasks]);

  useEffect(() => {
    // TODO: request current task info
    setCurrentTaskLoading(true);
    getCurrentTaskInfo(currentTaskId, currentActiveTaskIds[currentActiveTaskIds.length - 2], isDefault).then(currentTaskInfo => {
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

  useEffect(() => {
    const handler = (dispatch: Dispatch) => {
      if (dispatch.payloads.length === 0) { return }
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
        break;
      }
      case 'UPDATE': {
        const tasksToBeUpdated = [];
        const newTasks = Array.from(tasks);
        dispatch.payloads.forEach(payload => {
          const currentTaskIndex = newTasks.findIndex(task => task.taskId === payload.taskId);
          if (payload.taskId === (currentTask && currentTask.taskId)) {
            const newCurrentTaskInfo = _merge(_cloneDeep(currentTask), payload);
            setCurrentTask(newCurrentTaskInfo);
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
        if (tasksToBeUpdated.length > 0) {
          bus.emit('dispatch', { action: 'UPDATE', payloads: tasksToBeUpdated });
        }
        break;
      }
      case 'DELETE': {
        const dispatchUpdateTasks = [];
        const newTasks = tasks.filter(task => dispatch.payloads.findIndex(payload => payload.taskId === task.taskId) === -1);
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
                <Checkbox
                  checked={(currentTask && currentTask.finished) || false}
                  onChange={event => handleUpdateCurrentTask({ finished: event.target.checked })}
                />
                <DebouncedTextField
                  className="title-input"
                  value={(currentTask && currentTask.content)}
                  onChange={event => handleUpdateCurrentTask({ content: event.target.value })}
                />
              </>
              : <>
                <div style={{ width: 10 }}></div>
                <div className="title-input">{(currentTask && currentTask.content)}</div>
              </>
          }
        </Typography>
        <div className="task-list__log-wrapper__controls">
          <IconButton type="finish" onClick={handleFinishAllTasks} />
          {
            !isDefault &&
            <IconButton
              type="delete"
              onClick={() => bus.emit('push', {
                  action: 'DELETE',
                  payloads: [currentTask],
                })}
            />
          }
        </div>
      </div>
      {
        !isDefault
        && <div className="task-list__deadline">
          <DatePicker
            startDate={currentTask ? moment(new Date(currentTask.deadline)).add(-1, 'day').startOf('day').toDate() : new Date()}
            customComponent={generateStatus(currentTask)}
            zIndex={998}
            onConfirm={result => {
              if (result instanceof Date) {
                const newCurrentTaskInfo: TaskListItem = {
                  ...getTaskGenerateInfo(currentTask),
                  deadline: moment(result).startOf('day').add(1, 'day').toDate().toISOString(),
                };
                bus.emit('push', {
                  action: 'UPDATE',
                  payloads: [newCurrentTaskInfo],
                });
              }
            }}
          />
        </div>
      }
      <div className="task-list__items-wrapper">
        {
          taskListLoading || currentTaskLoading
            ? <span className="loading">请稍候...</span>
            : shownTasks.length !== 0
              ? <List className={theme.root} ref={taskListElement}>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={(currentTask && currentTask.taskId) || Math.random().toString(32).substr(2)}>
                    {
                      (provided, snapshot) => (
                        <div ref={provided.innerRef} className="task-items">
                          {
                            shownTasks.map((item, index) => (
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
        <DebouncedTextField
          value={addTaskContent}
          className="add-task-content"
          placeholder="键入 Enter 以添加新的子任务..."
          onPressEnter={handleAddTask}
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
          <DebouncedTextField
            type="textarea"
            placeholder="在这里写下任务描述..."
            value={(currentTask && currentTask.description) || ''}
            onChange={event => handleUpdateCurrentTask({ description: event.target.value })}
          />
        </div>
      }
      <TaskSelector
        visible={taskSelectorVisible}
        onClose={event => {
          event.stopPropagation();
          setTaskSelectorVisible(false);
        }}
        onSelectTask={handleMoveTasks}
      />
    </div>
  );
};

export const Empty: React.FC = () => <div className="task-list empty">点击左侧任意一个任务清单以查看任务详情</div>;
