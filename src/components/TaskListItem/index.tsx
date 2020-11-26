import React from 'react';
import './index.less';
import ListItem from '@material-ui/core/ListItem';
import { makeStyles } from '@material-ui/core/styles';
import { DragIcon } from '../../core/icons';
import Checkbox from '../Checkbox';
import DebouncedTextField from '../DebouncedTextField';

export interface TaskListItemBase {
  content: string;
  deadline: string;
  order: number;
  finished: boolean;
  finishedDate?: string;
  description?: string;
  parentTaskId: string;
}

export interface User {
  email: string;
  avatar: string;
  name?: string;
  birthday?: string;
  motto?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface TaskListItem extends TaskListItemBase {
  taskId: string;
}

export interface TaskListItemDetailInfo extends TaskListItem {
  creator: User;
  createdAt: string;
  updatedAt?: string;
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

export default React.forwardRef((props: TaskListItemProps, ref: React.LegacyRef<HTMLDivElement>) => {
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

  const theme = useStyles();

  const taskItem: TaskListItem = {
    content,
    taskId,
    deadline,
    order,
    finished,
    parentTaskId,
  };

  const handleContentChange = (content: string) => {
    const newTaskInfo = {
      ...taskItem,
      content,
    };
    onChange(newTaskInfo);
  };

  return (
    <div
      ref={ref}
      className={`${className} task-item${isDragging ? ' dragging' : ''}${selected ? ' selected' : ''}`}
      onClick={event => {
        event.preventDefault();
        onSelectionChange(taskItem);
      }}
    >
      <ListItem className={theme.taskListItem}>
        <div className="task-item__drag-control">
          <DragIcon className="icon" />
        </div>
        <div className={`task-item__content ${isDragging ? 'dragging' : ''}`}>
          <Checkbox
            onChange={event => onChange({
              ...taskItem,
              finished: event.target.checked,
              finishedDate: new Date().toISOString(),
            })}
            onClick={event => event.stopPropagation()}
            checked={taskItem.finished}
          />
          <DebouncedTextField
            value={content}
            onChange={event => handleContentChange(event.target.value)}
            className={`task-item__content__task-title${finished ? ' finished' : ''}`}
          />
        </div>
      </ListItem>
    </div>
  );
});
