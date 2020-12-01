import React from 'react';
import Bus from '../../../core/bus';
import TaskList, {
  Empty,
  Dispatch,
} from '../../../components/TaskList';
import { TaskListItem } from '../../../components/TaskListItem';
import './index.less';

export interface ListPageProps {
  bus: Bus<Dispatch>;
  currentActiveTaskIds: string[];
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
  dateRange: [Date, Date];
  className?: string;
}

const List: React.FC<ListPageProps> = ({
  bus,
  currentActiveTaskIds,
  onSelectedTasksChange,
  dateRange,
  className = '',
}) => {
  return (
    <div className={`app-list__page${className && ` ${className}` || ''}`}>
      {
        currentActiveTaskIds.map((currentActiveTaskId, index) => {
          return (
            <div className="app-list__page__task-wrapper" key={currentActiveTaskId}>
              <TaskList
                bus={bus}
                currentTaskId={currentActiveTaskId}
                onSelectedTasksChange={onSelectedTasksChange}
                currentActiveTaskIds={currentActiveTaskIds}
                dateRange={dateRange}
              />
            </div>
          );
        })
      }
      {
        currentActiveTaskIds.length === 0
          && <div className="app-list__page__task-wrapper empty">
            <Empty />
          </div>
      }
    </div>
  );
};

export default List;
