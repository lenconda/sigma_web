export { Dispatch } from './dispatch';
export { User } from './user';
export { IconProps } from './icons';
export {
  NotificationInfo,
  NotificationDetailInfo,
} from './notification';
export {
  PaginationConfig,
  PaginationResponse,
} from './http';
export {
  Template,
  TemplateBase,
} from './template';

export interface AppMenuItem {
  name?: string;
  path?: string;
  isDivider?: boolean;
  icon?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}
