import Bus from '../../core/bus';
import { Dispatch } from '../common';
import { TaskListItem } from './task_list_item';

export interface TaskList {
  currentTaskId: string;
  bus: Bus<Dispatch>;
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
  currentActiveTaskIds?: string[];
  isDefault?: boolean;
  dateRange: [Date, Date];
}
