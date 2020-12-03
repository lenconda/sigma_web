import { User } from '../common';

export interface NotificationInfo {
  notificationId: string;
  title: string;
  time: string;
  checked: boolean;
  subject?: string;
  sender?: User;
  receiver?: User;
}

export interface NotificationDetailInfo extends NotificationInfo {
  content: string;
}
