import {
  AppMenuItem,
} from '../interfaces';

export const getNavMenu = async (): Promise<AppMenuItem[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          name: '任务清单',
          path: '/home/list',
        },
        {
          name: '摘要',
          path: '/home/summary',
        },
      ]);
    }, 200);
  });
};

export const getAvatarMenu = async (): Promise<AppMenuItem[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          name: '账户设置',
          path: '/settings/profile',
        },
        {
          name: '摘要模板',
          path: '/settings/templates',
        },
        {
          isDivider: true,
        },
        {
          name: '用户文档',
          path: '/docs',
        },
        {
          name: '社区',
          path: '/community',
        },
        {
          name: '反馈与建议',
          path: '/feedback',
        },
        {
          isDivider: true,
        },
        {
          name: '登出',
          path: '/logout',
        },
      ]);
    }, 200);
  });
};
