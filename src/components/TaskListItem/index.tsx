import React from 'react';
import './index.less';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

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
  onCheckChange: (e: React.ChangeEvent<HTMLInputElement>, taskInfo: TaskListItem) => void;
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
    onCheckChange,
    parentTaskId,
  } = props;

  const taskItem: TaskListItem = {
    content,
    taskId,
    deadline,
    order,
    finished,
    originalDeadline,
    parentTaskId,
  };

  return (
    <div ref={ref as any} onClick={() => onSelectionChange(taskItem)}>
      <ListItem
        style={
          {
            boxSizing: 'border-box',
            display: 'flex',
            justifyContent: 'space-between',
            padding: 0,
            backgroundColor: selected ? '#f5f5f5' : '#fff',
            boxShadow: isDragging ? '0 0 10px rgba(0, 0, 0, .12)' : null,
          }
        }
        button={true}
      >
        <Checkbox color="primary" checked={finished} onChange={event => onCheckChange(event, taskItem)} />
        <div className={`task-item__content ${isDragging ? 'dragging' : ''}`}>
          <div>
            {
              finished
                ? <Typography variant="body2" color="textSecondary" className="finished">{content}</Typography>
                : <Typography variant="body2">{content}</Typography>
            }
          </div>
        </div>
      </ListItem>
    </div>
  );
});
