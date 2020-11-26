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
    if (currentValue) {
      result[key] = currentValue;
    }
    return result;
  }, {} as TaskListItem);
};

export {
  getTaskGenerateInfo,
};
