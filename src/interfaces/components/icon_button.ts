import {
  DragIcon,
  MoveIcon,
  ProgressIcon,
  DeleteIcon,
  FinishIcon,
  ListIcon,
  RefreshIcon,
  NotificationIcon,
  LoadingIcon,
} from '../../core/icons';

export interface IconTypes {
  drag: typeof DragIcon;
  move: typeof MoveIcon;
  progress: typeof ProgressIcon;
  delete: typeof DeleteIcon;
  finish: typeof FinishIcon;
  list: typeof ListIcon;
  refresh: typeof RefreshIcon;
  notification: typeof NotificationIcon;
  loading: typeof LoadingIcon;
}

export interface IconButtonProps {
  type: keyof IconTypes;
  className?: string;
  size?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  style?: React.CSSProperties;
  iconClasses?: string[];
  disabled?: boolean;
  spin?: boolean;
}