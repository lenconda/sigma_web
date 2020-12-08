import { User } from './user';

export interface TemplateBase {
  templateId: string;
  name: string;
  creator: User;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface Template extends TemplateBase {
  content: string;
}
