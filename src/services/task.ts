import {
  TaskListItem,
  TaskListItemDetailInfo,
} from '../interfaces';
import idGen from '../core/idgen';

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
    }, 50);
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
        parentTaskId: isDefault ? 'default' : parentId,
        finished: false,
        deadline: new Date().toISOString(),
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

export const getTaskListFromTask = async (taskId: string, count: number, isDefault = false): Promise<TaskListItem[]> => {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const task = await getTaskInfo(idGen(), (isDefault ? 'default' : taskId), isDefault, i);
    result.push(task);
  }
  return result;
};
