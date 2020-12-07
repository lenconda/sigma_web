import React from 'react';
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
} from '../../core/icons';
import {
  IconTypes,
  IconButtonProps,
} from '../../interfaces';
import './index.less';

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const {
    type,
    className = '',
    size = 16,
    onClick,
    style = {},
    iconClasses = [],
    disabled = false,
    spin = false,
  } = props;

  const icons: IconTypes = {
    drag: DragIcon,
    move: MoveIcon,
    progress: ProgressIcon,
    delete: DeleteIcon,
    finish: FinishIcon,
    list: ListIcon,
    refresh: RefreshIcon,
    template: TemplateIcon,
    loading: LoadingIcon,
    'notification-bordered': NotificationBorderedIcon,
    'list-expand': ListExpandIcon,
    'delete-list': DeleteListIcon,
    'arrow-up': ArrowUpIcon,
    'arrow-right': ArrowRightIcon,
    'arrow-down': ArrowDownIcon,
    'arrow-left': ArrowLeftIcon,
    calendar: CalendarIcon,
    alarm: AlarmIcon,
    'add-list': AddListIcon,
  };

  const Icon = icons[type];

  return <button
    onClick={onClick}
    ref={ref}
    disabled={disabled}
    className={`icon-button${className ? ` ${className}` : ''}`}
  >
    <Icon className={iconClasses.join(' ')} fontSize={size} style={style} spin={spin} />
  </button>;
});

export default IconButton;
