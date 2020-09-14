import React, { useState, useEffect, useRef } from 'react';
import Item, { TaskItem } from './Item';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import './index.less';

interface TaskList {
  listId: string;
  tasks: TaskItem[];
  selectedTasks: TaskItem[];
  onTasksChange: (newTasks: TaskItem[]) => void;
  onSelectedTasksChange: (newSelectedTasks: TaskItem[]) => void;
  onCheckChange: (e: React.ChangeEvent<HTMLInputElement>, taskInfo: TaskItem) => void;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
}));

const reorder = (list: TaskItem[], startIndex, endIndex): TaskItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const getItemStyle = (isDragging, draggableStyle) => ({
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
  } = props;
  const taskListElement = useRef(null);
  const [multiple, setMultiple] = useState<boolean>(false);
  const theme = useStyles();

  const onDragEnd = (result: DropResult) => {
    console.log(result);
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const currentList = reorder(tasks, source.index, destination.index);
    onTasksChange(currentList);
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
    const processCurrentTasks = (e: React.ChangeEvent<HTMLInputElement>, currentTask: TaskItem) => {
      if (currentTask.taskId === task.taskId) {
        return {
          ...currentTask,
          finished: e.target.checked,
        };
      }
      return currentTask;
    };
    const newTasks = tasks.map(currentTask => processCurrentTasks(e, currentTask));
    const newSelectedTasks = selectedTasks.map(currentTask => processCurrentTasks(e, currentTask));
    onTasksChange(newTasks);
    onSelectedTasksChange(newSelectedTasks);
    onCheckChange(e, task);
  };

  useEffect(() => {
    const handleMetaKey = (type: 'keydown' | 'keyup', event: KeyboardEvent) => {
      const { metaKey, ctrlKey, key } = event;
      if (metaKey || ctrlKey || key === 'Meta' || key === 'Control') {
        if (type === 'keydown') {
          setMultiple(true);
        } else if (type === 'keyup') {
          setMultiple(false);
        }
      }
    };
    window.addEventListener('keydown', event => handleMetaKey('keydown', event));
    window.addEventListener('keyup', event => handleMetaKey('keyup', event));
  }, [taskListElement]);

  return (
    <List className={theme.root} ref={taskListElement}>
      <DragDropContext onDragEnd={onDragEnd}>
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
                            style={getItemStyle(snapshot.isDragging, provided.draggableProps.style)}
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
  );
};
