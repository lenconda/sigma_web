import {
  TaskListItem,
  TaskListItemDetailInfo,
} from '../components';

export interface Dispatch {
  action: 'UPDATE' | 'DELETE' | 'ADD';
  payloads: TaskListItem[] | TaskListItemDetailInfo[];
}
