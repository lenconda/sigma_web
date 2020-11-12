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
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import './index.less';

interface Dispatch {
  action: 'UPDATE' | 'DELETE' | 'ADD';
  type: 'tasks' | 'sections';
  payload: TaskItem[] | any[];
}

interface TaskList {
  title: string;
  listId: string;
  tasks: TaskItem[];
  selectedTasks: TaskItem[];
  onTasksChange: (newTasks: TaskItem[]) => void;
  onSelectedTasksChange: (newSelectedTasks: TaskItem[]) => void;
  onCheckChange: (e: React.ChangeEvent<HTMLInputElement>, taskInfo: TaskItem) => void;
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

export default (props: TaskList) => {
  const {
    tasks,
    selectedTasks,
    onTasksChange,
    onSelectedTasksChange,
    onCheckChange,
    onDispatch,
  } = props;
  const taskListElement = useRef(null);
  const [multiple, setMultiple] = useState<boolean>(false);
  const [flag, setFlag] = useState<number>(0);
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
    onDispatch({ action: 'UPDATE', type: 'tasks', payload: dispatchUpdateTasks });
    onTasksChange(currentTasks);
  };

  const handleSelectionChange = (task: TaskItem) => {
    const currentTaskIndex = selectedTasks.findIndex(currentTask => currentTask.taskId === task.taskId);
    let newSelectedTasks = [];
    if (multiple) {
      if (currentTaskIndex === -1) {
        onSelectedTasksChange(selectedTasks.concat(task));
      } else {
        newSelectedTasks = selectedTasks.slice(0, currentTaskIndex).concat(selectedTasks.slice(currentTaskIndex + 1));
        onSelectedTasksChange(newSelectedTasks);
      }
    } else {
      onSelectedTasksChange([task]);
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
      type: 'tasks',
      payload: [checkChangeTask],
    });
    const newSelectedTasks = selectedTasks.map(currentTask => processCurrentTasks(e, currentTask));
    onSelectedTasksChange(newSelectedTasks);
    onCheckChange(e, task);
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
      onDispatch({ action: 'DELETE', type: 'tasks', payload: dispatchDeleteTasks });
      onDispatch({ action: 'UPDATE', type: 'tasks', payload: dispatchUpdateTasks });
      onTasksChange(newTasks);
      onSelectedTasksChange([]);
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

  return (
    <div className="task-list">
      <div className="task-list__title-bar">
        <Typography variant="h6">{props.title}</Typography>
        <div className="task-list__log-wrapper__controls"></div>
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
          <Droppable droppableId={props.listId}>
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
                                deadline={new Date().toISOString()}
                                finished={item.finished}
                                onSelectionChange={handleSelectionChange}
                                onCheckChange={handleCheckChange}
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
      <div className="task-list__log-wrapper">
        <textarea placeholder="在这里写下任务描述..."></textarea>
      </div>
    </div>
  );
};
