import { User } from '../common';

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

export interface TaskListItemDetailInfo extends TaskListItem {
  creator: User;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface TaskListItemProps extends TaskListItem {
  isDragging: boolean;
  selected?: boolean;
  className?: string;
  focus?: boolean;
  onSelectionChange: (taskInfo: TaskListItem) => void;
  onChange: (taskInfo: TaskListItem) => void;
  onDelete?: (taskInfo: TaskListItem) => void;
  onPressEnter?: (taskInfo: TaskListItem) => void;
}
