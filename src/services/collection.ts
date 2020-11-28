import {
  TaskListItem,
} from '../components/TaskListItem';
import {
  Collection,
} from '../components/TaskList';
import idGen from '../core/idgen';

export const getCollectionInfo = async (collectionId: string): Promise<Collection> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        collectionId,
        name: Math.random().toString(32),
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
    }, 100);
  });
};

export const getCollections = async (count: number): Promise<Collection[]> => {
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const task = await getCollectionInfo(idGen());
    result.push(task);
  }
  return result;
};
