import React from 'react';
import Bus from '../../core/bus';
import TaskList, { Dispatch } from '../../components/TaskList';
import './index.less';

export interface ListPageProps {
  bus: Bus<Dispatch>;
  currentActiveTaskIds: string[];
}

const List: React.FC<ListPageProps> = ({
  bus,
  currentActiveTaskIds,
}) => {
  return (
    <div className="page-list">
      <div className="page-list__task-wrapper">
        <TaskList bus={bus} currentTaskId="default" currentActiveTaskIds={currentActiveTaskIds} />
      </div>
      {
        currentActiveTaskIds.map((currentActiveTaskId, index) => (
          <div className="page-list__task-wrapper" key={index}>
            <TaskList
              bus={bus}
              currentTaskId={currentActiveTaskId}
              currentActiveTaskIds={currentActiveTaskIds}
            />
          </div>
        ))
      }
    </div>
  );
};

export default List;
