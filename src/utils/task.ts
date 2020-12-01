import {
  TaskListItemDetailInfo,
  TaskListItem,
} from '../components/TaskListItem';

const getTaskGenerateInfo = (taskDetail: TaskListItemDetailInfo): TaskListItem => {
  const {
    content,
    deadline,
    order,
    finished,
    finishedDate,
    description,
    parentTaskId,
    taskId,
  } = taskDetail;
  const taskGenerateInfoWithUndefined = {
    content,
    deadline,
    order,
    finished,
    finishedDate,
    description,
    parentTaskId,
    taskId,
  };
  return Object.keys(taskGenerateInfoWithUndefined).reduce<TaskListItem>((result, key) => {
    const currentValue = taskGenerateInfoWithUndefined[key];
    if (typeof currentValue !== 'undefined' || !!currentValue) {
      result[key] = currentValue;
    }
    return result;
  }, {} as TaskListItem);
};

export const checkAllTaskFinished = (tasks: TaskListItem[] | TaskListItemDetailInfo[]) => {
  for (let task of tasks) {
    if (!task.finished) { return false }
  }
  return true;
};

export {
  getTaskGenerateInfo,
};
