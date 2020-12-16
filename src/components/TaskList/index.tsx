/* eslint-disable max-nested-callbacks */
import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import Item from '../TaskListItem';
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
import moment from 'moment';
import idGen from '../../core/idgen';
import TaskSelector from '../TaskSelector';
import DatePicker from '../DatePicker';
import {
  getTaskListFromTask,
  getCurrentTaskInfo,
} from '../../services/task';
import {
  AlarmIcon,
  AddListIcon,
  TreeIcon,
  AddIcon,
  CloseIcon,
} from '../../core/icons';
import IconButton from '../IconButton';
import Chip from '@material-ui/core/Chip';
import _merge from 'lodash/merge';
import _cloneDeep from 'lodash/cloneDeep';
import {
  getTaskGenerateInfo,
  checkAllTaskFinished,
} from '../../utils/task';
import Checkbox from '../Checkbox';
import DebouncedTextField from '../DebouncedTextField';
import {
  TaskListItem,
  TaskListItemDetailInfo,
  Dispatch,
  TaskList,
} from '../../interfaces';
import './index.less';

const useStyles = makeStyles(() => ({
  root: {
    width: '100%',
    padding: 0,
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
  const dateString = moment(deadline).format('YYYY-MM-DD HH:mm');
  return (
    <div>
      <Button size="small" startIcon={<AlarmIcon style={{ color: '#aaa' }} />}>
        <Typography
          color="textSecondary"
          variant="body2"
          classes={{ colorTextSecondary: 'task-list__status-text' }}
        >
          {dateString}
        </Typography>
      </Button>
      &nbsp;
      <Chip
        size="small"
        classes={{ sizeSmall: 'task-list__badge' }}
        color={delayDays > 0 ? 'secondary' : 'default'}
        label={`${status}${delayDays > 0 ? `，过期 ${Math.abs(delayDays)} 天` : ''}`}
      />
    </div>

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
  const [effectUpdates, setEffectUpdates] = useState<TaskListItem[]>([]);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [currentFocusedTask, setCurrentFocusedTask] = useState<TaskListItem>(undefined);
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

  const handleTaskStatusChange = (task: TaskListItem) => {
    if ((currentFocusedTask && currentFocusedTask.taskId) === task.taskId) {
      setCurrentFocusedTask(undefined);
    }
    const payloads = [task];
    bus.emit('push', { action: 'UPDATE', payloads });
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

  const handleDeleteTasks = (tasks: TaskListItem[] = selectedTasks) => {
    if (tasks.length === 0) { return }
    const dispatchDeleteTasks = Array.from(tasks);
    bus.emit('push', { action: 'DELETE', payloads: dispatchDeleteTasks });
  };

  const handleAddTask = () => {
    if (typeof addTaskContent === 'string' && addTaskContent !== '') {
      const deadline = moment().add(1, 'day').startOf('day').toISOString();
      const taskToBeAdded: TaskListItem = {
        content: addTaskContent,
        deadline,
        finished: false,
        order: -1,
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
    const currentSelectedTasks = Array.from(selectedTasks);
    const currentSelectedNewTasks = Array.from(selectedTasks).map(task => ({
      ...task,
      parentTaskId: newParentTask.taskId,
    }));
    bus.emit('push', { action: 'ADD', payloads: currentSelectedNewTasks });
    bus.emit('push', { action: 'DELETE', payloads: currentSelectedTasks });
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
        getTaskListFromTask(currentTaskId, Math.floor(Math.random() * 8) + 1)
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
        const tempNewTasks = Array.from(tasks);
        const tasksToBeAdded = [];
        const tasksToBeAppended = [];
        const updateTaskPayloads = [];
        dispatch.payloads.forEach(payload => {
          if (payload.parentTaskId === (currentTask && currentTask.taskId)) {
            const appendTasks = () => {
              payload.order = tempNewTasks.length;
              tasksToBeAppended.push(payload);
              tempNewTasks.push(payload);
            };
            if (payload.order === -1) {
              appendTasks();
            } else {
              const previousTaskIndex = tempNewTasks.findIndex(task => task.order === payload.order - 1);
              if (previousTaskIndex === -1) {
                appendTasks();
              } else {
                tempNewTasks.splice(previousTaskIndex + 1, 0, payload);
                tasksToBeAdded.push(payload);
              }
            }
          }
        });
        const addTaskPayloads = tasksToBeAdded.concat(tasksToBeAppended);
        tempNewTasks.map((task, index) => {
          if (task.order !== index) {
            task.order = index;
            updateTaskPayloads.push(task);
          }
          return task;
        });
        if (addTaskPayloads.length !== 0) {
          bus.emit('dispatch', { action: 'ADD', payloads: addTaskPayloads });
        }
        if (updateTaskPayloads.length !== 0) {
          bus.emit('push', { action: 'UPDATE', payloads: updateTaskPayloads });
        }
        setTasks(tempNewTasks);
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
            if (newCurrentTaskInfo.finished) {
              const unfinishedTasks = Array
                .from(tasks)
                .filter(task => !task.finished)
                .map(task => ({ ...task, finished: true }));
              if (unfinishedTasks.length > 0) {
                setEffectUpdates(unfinishedTasks);
              }
            }
          } else if (
            currentTaskIndex !== -1
            && payload.parentTaskId === (currentTask && currentTask.taskId)
          ) {
            tasksToBeUpdated.push(payload);
            newTasks.splice(currentTaskIndex, 1, payload);
            const currentTaskGenerateInfo = getTaskGenerateInfo(currentTask);
            if (checkAllTaskFinished(newTasks) && !currentTask.finished) {
              setEffectUpdates([{ ...currentTaskGenerateInfo, finished: true }]);
            }
            if (!checkAllTaskFinished(newTasks) && currentTask.finished) {
              setEffectUpdates([{ ...currentTaskGenerateInfo, finished: false }]);
            }
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

  useEffect(() => {
    if (effectUpdates.length > 0) {
      bus.emit('push', { action: 'UPDATE', payloads: effectUpdates });
      setEffectUpdates([]);
    }
  }, [effectUpdates]);

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
        && <div className="task-list__header">
          <DatePicker
            startDate={currentTask ? new Date(currentTask.deadline) : new Date()}
            customComponent={generateStatus(currentTask)}
            zIndex={998}
            showTimeSelect={true}
            onConfirm={result => {
              if (result instanceof Date) {
                const newCurrentTaskInfo: TaskListItem = {
                  ...getTaskGenerateInfo(currentTask),
                  deadline: result.toISOString(),
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
        <div className="task-list__items-wrapper__description">
          <DebouncedTextField
            type="textarea"
            placeholder="在这里写下任务描述..."
            className="textfield"
            value={(currentTask && currentTask.description) || ''}
            onChange={event => handleUpdateCurrentTask({ description: event.target.value })}
          />
        </div>
        {
          shownTasks.length !== 0
            && <div className="task-list__items-wrapper__controls">
              <h1><TreeIcon />子任务</h1>
              {
                selectedTasks.length !== 0
                  && <div className="buttons">
                    <IconButton
                      type="move"
                      onClick={() => setTaskSelectorVisible(true)}
                    />
                    <IconButton
                      type="delete-list"
                      onClick={() => handleDeleteTasks()}
                    />
                  </div>
              }
            </div>
        }
        {
          taskListLoading || currentTaskLoading
            ? <span className="loading">请稍候...</span>
            : shownTasks.length !== 0
              ? <List className={theme.root} ref={taskListElement}>
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId={(currentTask && currentTask.taskId) || Math.random().toString(32).substr(2)}>
                    {
                      provided => (
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
                                        parentTaskId={item.parentTaskId}
                                        onSelectionChange={handleSelectionChange}
                                        onChange={handleTaskStatusChange}
                                        onDelete={task => handleDeleteTasks([task])}
                                        focus={(currentFocusedTask && currentFocusedTask.taskId) === item.taskId}
                                        onPressEnter={task => {
                                          const taskInfo: TaskListItem = {
                                            taskId: idGen(),
                                            content: '',
                                            order: task.order + 1,
                                            finished: false,
                                            deadline: moment().add(1, 'day').startOf('day').toISOString(),
                                            parentTaskId: currentTask.taskId,
                                          };
                                          setSelectedTasks([taskInfo]);
                                          setCurrentFocusedTask(taskInfo);
                                          bus.emit('push', {
                                            action: 'ADD',
                                            payloads: [taskInfo],
                                          });
                                        }}
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
              : null
        }
      </div>
      <div className="task-list__bottom-wrapper">
        <div className="buttons">
          {
            !showAddTask
              && <Button
                startIcon={<AddListIcon style={{ fontSize: 12 }} />}
                variant="text"
                size="small"
                fullWidth={true}
                className={`app-button${showAddTask && ' active' || ''} add-task-control-button`}
                onClick={() => setShowAddTask(!showAddTask)}
              >
                添加子任务
              </Button>
          }
        </div>
        <div className={`add-task${showAddTask && ' show' || ''}`}>
          <DebouncedTextField
            type="textarea"
            value={addTaskContent}
            className="app-textfield textfield"
            placeholder="键入新的子任务的内容..."
            onChange={event => setAddTaskContent(event.target.value)}
          />
          <div className="add-task__buttons">
            <Button
              color="primary"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleAddTask()}
            >
              添加
            </Button>
            <Button
              color="default"
              variant="text"
              startIcon={<CloseIcon />}
              onClick={() => {
                setAddTaskContent('');
                setShowAddTask(false);
              }}
            >
              放弃
            </Button>
          </div>
        </div>
      </div>
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
