import { TaskListItem } from './task_list_item';

export interface TaskSelectorProps {
  visible: boolean;
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onSelectTask: (task: TaskListItem) => void;
}

export interface TaskSelectorMenuItem extends TaskListItem {
  children: TaskSelectorMenuItem[];
}
