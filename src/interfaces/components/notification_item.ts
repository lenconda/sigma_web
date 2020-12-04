import {
  NotificationInfo,
} from '../../interfaces';

export interface NotificationItemProps {
  notification: NotificationInfo;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}
