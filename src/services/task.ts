import { TaskListItem } from '../components/TaskListItem';
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
        taskId: taskId,
        parentTaskId: isDefault ? 'default' : parentId,
        finished: false,
        deadline: new Date().toISOString(),
        content: isDefault ? '全部任务' : taskId,
        order,
      });
    }, 100);
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
