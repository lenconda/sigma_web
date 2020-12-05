import {
  NotificationInfo,
  NotificationDetailInfo,
  PaginationResponse,
  PaginationConfig,
} from '../interfaces';

export const generateNotification = async (
  notificationId: string = Math.random().toString(32),
): Promise<NotificationInfo> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        notificationId,
        title: Math.random().toString(32),
        subject: Math.random().toString(32),
        time: new Date().toISOString(),
        checked: Math.floor(Math.random() * 10) % 2 === 0,
        sender: {
          name: Math.random().toString(32),
          email: `${Math.random().toString(32)}@example.com`,
          avatar: '/assets/images/default_avatar.jpg',
          createdAt: new Date().toISOString(),
        },
      });
    }, 100);
  });
};

export const getNotifications = async (
  pagination: PaginationConfig = { current: 1, size: 10 },
  count: number = 10,
): Promise<PaginationResponse<NotificationInfo[]>> => {
  const items = [];
  for (let i = 0; i < count; i += 1) {
    items.push(await generateNotification());
  }
  return {
    items,
    total: 1000,
    current: 10,
    size: 10,
  };
};

export const getNotificationDetailInfo = async (
  notificationId: string,
): Promise<NotificationDetailInfo> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        notificationId,
        title: Math.random().toString(32),
        subject: Math.random().toString(32),
        time: new Date().toISOString(),
        checked: Math.floor(Math.random() * 10) % 2 === 0,
        content: Math.random().toString(32),
        sender: {
          name: Math.random().toString(32),
          email: `${Math.random().toString(32)}@example.com`,
          avatar: '/assets/images/default_avatar.jpg',
          createdAt: new Date().toISOString(),
        },
      });
    }, 500);
  });
};
