import {
  NotificationInfo,
  NotificationDetailInfo,
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
  count: number = 10,
): Promise<NotificationInfo[]> => {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    result.push(await generateNotification());
  }
  return result;
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
      });
    }, 500);
  });
};
