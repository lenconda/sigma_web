import React, { useState } from 'react';
import './index.less';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import DehazeIcon from '@material-ui/icons/Dehaze';
import {
  useUpdateEffect,
  useDebouncedValue,
} from '../../core/hooks';
import { makeStyles } from '@material-ui/core/styles';

export interface TaskListItemBase {
  content: string;
  deadline: string;
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
  className?: string;
}

const useStyles = makeStyles(() => ({
  taskListItem: {
    padding: 0,
  },
}));

export default React.forwardRef((props: TaskListItemProps, ref) => {
  const {
    content,
    isDragging,
    taskId,
    deadline,
    order,
    finished,
    selected = false,
    onSelectionChange,
    onChange,
    parentTaskId,
    className = '',
  } = props;

  const [currentTaskContent, setCurrentTaskContent] = useState<string>('');
  const theme = useStyles();

  const taskItem: TaskListItem = {
    content,
    taskId,
    deadline,
    order,
    finished,
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
    <div
      ref={ref as any}
      className={`${className} task-item ${isDragging ? 'dragging' : ''} ${selected ? 'selected' : ''}`}
      onClick={() => onSelectionChange(taskItem)}
    >
      <ListItem className={theme.taskListItem}>
        <div className="task-item__drag-control">
          <DehazeIcon fontSize="small" className="icon" />
        </div>
        <div className={`task-item__content ${isDragging ? 'dragging' : ''}`}>
          <Checkbox
            color="primary" checked={finished}
            onChange={event => onChange({ ...taskItem, finished: event.target.checked })}
            onClick={event => event.stopPropagation()}
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
