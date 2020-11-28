import React from 'react';
import Bus from '../../../core/bus';
import TaskList, {
  Empty,
  Dispatch,
} from '../../../components/TaskList';
import { TaskListItem } from '../../../components/TaskListItem';
import './index.less';

export interface CollectionPageProps {
  bus: Bus<Dispatch>;
  currentActiveTaskIds: string[];
  onSelectedTasksChange: (tasks: TaskListItem[]) => void;
}

const Collection: React.FC<CollectionPageProps> = ({
  bus,
  currentActiveTaskIds,
  onSelectedTasksChange,
}) => {
  return (
    <div className="page-list">
      {
        currentActiveTaskIds.map((currentActiveTaskId, index) => {
          return (
            <div className="page-list__task-wrapper" key={currentActiveTaskId}>
              <TaskList
                bus={bus}
                isCollection={index === 0}
                currentId={currentActiveTaskId}
                onSelectedTasksChange={onSelectedTasksChange}
                currentActiveTaskIds={currentActiveTaskIds}
              />
            </div>
          );
        })
      }
      {
        currentActiveTaskIds.length === 0
          && <div className="page-list__task-wrapper empty">
            <Empty />
          </div>
      }
    </div>
  );
};

export default Collection;
