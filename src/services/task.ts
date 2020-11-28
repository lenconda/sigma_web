import {
  TaskListItem,
  TaskListItemDetailInfo,
} from '../components/TaskListItem';
import idGen from '../core/idgen';
import moment from 'moment';

export const getTaskInfo = async (
  taskId: string,
  parentId?: string,
  isDefault: boolean = false,
  order = 0,
): Promise<TaskListItem> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        taskId,
        parentTaskId: isDefault ? 'default' : parentId,
        finished: false,
        deadline: new Date().toISOString(),
        content: isDefault ? '全部任务' : taskId,
        order,
      });
    }, 100);
  });
};

export const getCurrentTaskInfo = async (
  taskId: string,
  parentId?: string,
  isDefault: boolean = false,
  order = 0,
): Promise<TaskListItemDetailInfo> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        taskId: taskId,
        parentTaskId: parentId,
        finished: false,
        deadline: moment(new Date()).startOf('day').add(1, 'day').toISOString(),
        content: isDefault ? '全部任务' : taskId,
        order,
        creator: {
          email: 'test@example.com',
          name: 'test',
          avatar: '/assets/images/default_avatar.jpg',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }, 400);
  });
};

export const getTaskListFromTask = async (taskId: string, count: number): Promise<TaskListItem[]> => {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const task = await getTaskInfo(idGen(), taskId, false, i);
    result.push(task);
  }
  return result;
};
