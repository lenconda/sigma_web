import React, { useState, useEffect, useRef } from 'react';
import Item, { TaskItem } from './Item';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import './index.less';

interface TaskList {
  listId: string;
  tasks: TaskItem[];
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
  const [tasks, setTasks] = useState<TaskItem[]>(props.tasks);
  const [selectedTasks, setSelectedTasks] = useState<TaskItem[]>([]);
  const taskListElement = useRef(null);
  const theme = useStyles();

  const onDragEnd = (result: DropResult) => {
    console.log(result);
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const currentList = reorder(tasks, source.index, destination.index);
    setTasks(currentList);
  };

  useEffect(() => {
    // console.log(taskListElement.current.addEventListener);
    window.addEventListener('keydown', event => {
      console.log(event.key);
    });
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
                              selected={false}
                              isDragging={snapshot.isDragging}
                              content={item.content}
                              taskId={item.taskId}
                              order={item.order}
                              deadline={new Date().toISOString()}
                              onSelectionChange={(e, task) => props.onCheckChange(e, task)}
                              finished={item.finished}
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
