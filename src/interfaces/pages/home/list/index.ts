import {
  TaskListItem,
} from '../../../components';
import {
  Dispatch,
} from '../../../common';
import Bus from '../../../../core/bus';

export interface ListPageProps {
  bus: Bus<Dispatch>;
  currentActiveTaskIds: string[];
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
  dateRange: [Date, Date];
  className?: string;
}
