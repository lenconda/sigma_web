import {
  User,
} from '../components/TaskListItem';

export const getUserInfo = async (): Promise<User> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        email: 'test@example.com',
        name: 'test',
        avatar: '/assets/images/default_avatar.jpg',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }, 100);
  });
};
