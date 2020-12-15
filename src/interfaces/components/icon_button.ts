import {
  DragIcon,
  MoveIcon,
  ProgressIcon,
  DeleteIcon,
  FinishIcon,
  ListIcon,
  RefreshIcon,
  TemplateIcon,
  LoadingIcon,
  NotificationBorderedIcon,
  ListExpandIcon,
  DeleteListIcon,
  ArrowUpIcon,
  ArrowRightIcon,
  ArrowDownIcon,
  ArrowLeftIcon,
  CalendarIcon,
  AlarmIcon,
  AddListIcon,
  AddIcon,
  TreeIcon,
  CloseIcon,
} from '../../core/icons';

export interface IconTypes {
  drag: typeof DragIcon;
  move: typeof MoveIcon;
  progress: typeof ProgressIcon;
  delete: typeof DeleteIcon;
  finish: typeof FinishIcon;
  list: typeof ListIcon;
  refresh: typeof RefreshIcon;
  template: typeof TemplateIcon;
  loading: typeof LoadingIcon;
  'notification-bordered': typeof NotificationBorderedIcon;
  'list-expand': typeof ListExpandIcon;
  'delete-list': typeof DeleteListIcon;
  'arrow-up': typeof ArrowUpIcon;
  'arrow-right': typeof ArrowRightIcon;
  'arrow-down': typeof ArrowDownIcon;
  'arrow-left': typeof ArrowLeftIcon;
  calendar: typeof CalendarIcon;
  alarm: typeof AlarmIcon;
  'add-list': typeof AddListIcon;
  add: typeof AddIcon;
  tree: typeof TreeIcon;
  close: typeof CloseIcon;
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
