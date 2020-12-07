import { Pagination } from '@material-ui/lab';
import {
  PaginationResponse,
  PaginationConfig,
  TemplateBase,
  User,
} from '../interfaces';
import { getUserInfo } from './user';

const generateTemplateBase = async (creator: User): Promise<TemplateBase> => {
  return new Promise(resolve => {
    setTimeout(() => resolve({
      templateId: Math.random().toString(32),
      name: Math.random().toString(32),
      creator,
      createdAt: new Date().toISOString(),
    }), 100);
  });
};

export const getTemplateList = async (
  pagination: PaginationConfig,
  count: number = 10,
): Promise<PaginationResponse<TemplateBase[]>> => {
  const creator = await getUserInfo();
  const items: TemplateBase[] = [];
  for (let i = 0; i < count; i += 1) {
    items.push(await generateTemplateBase(creator));
  }
  return {
    total: Math.floor(Math.random() * 300),
    items,
    ...pagination,
  };
};
