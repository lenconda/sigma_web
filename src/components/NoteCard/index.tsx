import React from 'react';
import TaskItem from '../TaskItem';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './index.less';

interface Item {
  id: string;
  content: string;
}

const getItems = (count, offset = 0) => Array.from({ length: count }, (v, k) => k).map(k => ({
  id: `item-${k + offset}`,
  content: `item ${k + offset}`,
}));

const reorder = (list: Item[], startIndex, endIndex): Item[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  // styles we need to apply on draggables
  ...draggableStyle,
});

const getListStyle = isDraggingOver => ({
  background: isDraggingOver ? 'lightblue' : 'lightgrey',
  padding: grid,
  width: 250,
});

export default () => {
  const [state, setState] = React.useState<Item[]>(getItems(30));

  const onDragEnd = result => {
    const { source, destination } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    const currentList = reorder(state, source.index, destination.index);
    setState(currentList);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="parent">
        <Droppable droppableId="droppable1">
          {
            (provided, snapshot) => (
              <div
                className="half"
                ref={provided.innerRef}
                style={getListStyle(snapshot.isDraggingOver)}
              >
                <h4>List 1</h4>
                {
                  state.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {
                        (provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={getItemStyle(
                              snapshot.isDragging,
                              provided.draggableProps.style,
                            )}
                          >
                            <TaskItem
                              isDragging={snapshot.isDragging}
                              name={item.content}
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
      </div>
    </DragDropContext>
  );
};
