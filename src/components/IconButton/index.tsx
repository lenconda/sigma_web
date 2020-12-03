import React from 'react';
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
    notification: NotificationIcon,
    loading: LoadingIcon,
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
