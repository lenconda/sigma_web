import React from 'react';
import './index.less';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import ListItem from '@material-ui/core/ListItem';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';

export interface TaskItem {
  content: string;
  taskId: string;
  deadline: string;
  order: number;
  finished: boolean;
}

export interface TaskItemProps extends TaskItem {
  isDragging: boolean;
  selected?: boolean;
  onSelectionChange: (taskInfo: TaskItem) => void;
  onCheckChange: (e: React.ChangeEvent<HTMLInputElement>, taskInfo: TaskItem) => void;
}

const useStyles = makeStyles({
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: 'space-between',
    padding: 0,
    backgroundColor: '#fff',
  },
  selected: {
    backgroundColor: '#f5f5f5',
  },
  dragging: {
    boxShadow: '0 0 10px rgba(0, 0, 0, .12)',
  },
});

export default React.forwardRef((props: TaskItemProps, ref) => {
  const {
    content,
    isDragging,
    taskId,
    deadline,
    order,
    finished,
    selected = false,
    onSelectionChange,
    onCheckChange,
  } = props;
  const styles = useStyles();
  const taskItem: TaskItem = {
    content,
    taskId,
    deadline,
    order,
    finished,
  };

  return (
    <div ref={ref as any} onClick={() => onSelectionChange(taskItem)}>
      <ListItem
        className={clsx(styles.root, { [styles.selected]: selected, [styles.dragging]: isDragging })}
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
