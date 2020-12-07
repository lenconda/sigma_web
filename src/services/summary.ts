import Mock from 'mockjs';

export const getSummary = async (taskId: string, dateRange: [Date, Date]): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(Mock.mock('@cword(2000)'));
    }, 300);
  });
};
