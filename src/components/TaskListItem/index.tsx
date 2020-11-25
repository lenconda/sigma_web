import React, { useState } from 'react';
import './index.less';
import ListItem from '@material-ui/core/ListItem';
import {
  useUpdateEffect,
  useDebouncedValue,
} from '../../core/hooks';
import { makeStyles } from '@material-ui/core/styles';
import EditableField from '../EditableField';
import { DragIcon } from '../../core/icons';

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
          <input
            type="checkbox"
            checked={taskItem.finished}
            onChange={event => onChange({
              ...taskItem,
              finished: event.target.checked,
              finishedDate: new Date().toISOString(),
            })}
            onClick={event => event.stopPropagation()}
          />
          <EditableField
            content={content}
            onChange={event => setCurrentTaskContent(event.target.value)}
            className={`task-item__content__task-title${finished ? ' finished' : ''}`}
          />
        </div>
      </ListItem>
    </div>
  );
});
