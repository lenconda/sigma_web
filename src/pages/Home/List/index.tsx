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
}

const List: React.FC<ListPageProps> = ({
  bus,
  currentActiveTaskIds,
  onSelectedTasksChange,
}) => {
  return (
    <div className="app-list__page">
      {
        currentActiveTaskIds.map((currentActiveTaskId, index) => {
          return (
            <div className="app-list__page__task-wrapper" key={currentActiveTaskId}>
              <TaskList
                bus={bus}
                currentTaskId={currentActiveTaskId}
                onSelectedTasksChange={onSelectedTasksChange}
                currentActiveTaskIds={currentActiveTaskIds}
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
