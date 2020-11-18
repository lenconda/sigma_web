import React, { useState } from 'react';
import './index.less';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import DehazeIcon from '@material-ui/icons/Dehaze';
import {
  useUpdateEffect,
  useDebouncedValue,
} from '../../core/hooks';

export interface TaskListItemBase {
  content: string;
  deadline: string;
  originalDeadline: string;
  order: number;
  finished: boolean;
  finishedDate?: string;
  description?: string;
  parentTaskId: string;
}

export interface TaskListItem extends TaskListItemBase {
  taskId: string;
}

export interface TaskListItemProps extends TaskListItem {
  isDragging: boolean;
  selected?: boolean;
  onSelectionChange: (taskInfo: TaskListItem) => void;
  onChange: (taskInfo: TaskListItem) => void;
}

export default React.forwardRef((props: TaskListItemProps, ref) => {
  const {
    content,
    isDragging,
    taskId,
    deadline,
    originalDeadline,
    order,
    finished,
    selected = false,
    onSelectionChange,
    onChange,
    parentTaskId,
  } = props;

  const [currentTaskContent, setCurrentTaskContent] = useState<string>('');

  const taskItem: TaskListItem = {
    content,
    taskId,
    deadline,
    order,
    finished,
    originalDeadline,
    parentTaskId,
  };

  const debouncedCurrentTaskTitle = useDebouncedValue(currentTaskContent, 500);

  useUpdateEffect(() => {
    const newTaskInfo = {
      ...taskItem,
      content: debouncedCurrentTaskTitle,
    };
    onChange(newTaskInfo);
  }, [debouncedCurrentTaskTitle]);

  return (
    <div ref={ref as any} onClick={() => onSelectionChange(taskItem)} className="task-item-wrapper">
      <ListItem
        style={
          {
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'space-between',
            padding: 0,
            borderRadius: 5,
            backgroundColor: selected ? '#eaeaea' : '#fff',
            boxShadow: isDragging ? '0 10px 30px 5px rgba(0, 0, 0, .08)' : null,
          }
        }
        className={`task-item ${isDragging ? 'dragging' : ''}`}
        button={true}
      >
        <div className="task-item__drag-control">
          <DehazeIcon fontSize="small" className="icon" />
        </div>
        <div className={`task-item__content ${isDragging ? 'dragging' : ''}`}>
          <Checkbox
            color="primary" checked={finished}
            onChange={event => {
              event.stopPropagation();
              event.preventDefault();
              onChange({ ...taskItem, finished: event.target.checked });
              return false;
            }}
          />
          <input
            defaultValue={content}
            className={`task-item__content__task_title ${finished ? 'finished' : ''}`}
            onChange={event => setCurrentTaskContent(event.target.value)}
          />
        </div>
      </ListItem>
    </div>
  );
});
