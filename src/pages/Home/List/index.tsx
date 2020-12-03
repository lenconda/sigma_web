import React from 'react';
import TaskList, { Empty } from '../../../components/TaskList';
import { ListPageProps } from '../../../interfaces/pages/home/list';
import './index.less';

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
