import React from 'react';
import { connect } from 'dva';
import TaskList, { Empty } from '../../../components/TaskList';
import { ListPageProps } from '../../../interfaces/pages/home/list';
import { ConnectState } from '../../../interfaces/models';
import { TaskListItem } from '../../../interfaces';
import './index.less';

const List: React.FC<ListPageProps> = ({
  bus,
  currentActiveTaskIds,
  dateRange,
  className = '',
  dispatch: modelDispatch,
}) => {
  const handleSelectedTasksChange = (tasks: TaskListItem[]) => {
    if (tasks.length === 1) {
      const task = tasks[0];
      const activeParentIndex = currentActiveTaskIds.indexOf(task.parentTaskId);
      if (activeParentIndex !== -1) {
        const newActiveTaskIds = activeParentIndex === currentActiveTaskIds.length - 1
          ? Array.from(currentActiveTaskIds).concat([task.taskId])
          : Array.from(currentActiveTaskIds).slice(0, activeParentIndex + 1).concat([task.taskId]);
        modelDispatch({
          type: 'global/setCurrentActiveTaskIds',
          payload: newActiveTaskIds,
        });
      }
    }
  };

  return (
    <div className={`app-list__page${className && ` ${className}` || ''}`}>
      {
        currentActiveTaskIds.map((currentActiveTaskId, index) => {
          return (
            <div className="app-list__page__task-wrapper" key={currentActiveTaskId}>
              <TaskList
                bus={bus}
                currentTaskId={currentActiveTaskId}
                onSelectedTasksChange={handleSelectedTasksChange}
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

export default connect((state: ConnectState) => state.global)(List);
