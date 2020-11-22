import React from 'react';
import Bus from '../../core/bus';
import TaskList, {
  Dispatch,
} from '../../components/TaskList';
import { TaskListItem } from '../../components/TaskListItem';
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
    <div className="page-list">
      {
        currentActiveTaskIds.map((currentActiveTaskId, index) => (
          <div className="page-list__task-wrapper" key={index}>
            <TaskList
              bus={bus}
              isDefault={index === 0}
              currentTaskId={currentActiveTaskId}
              currentActiveTaskIds={currentActiveTaskIds}
              onSelectedTasksChange={onSelectedTasksChange}
            />
          </div>
        ))
      }
    </div>
  );
};

export default List;
