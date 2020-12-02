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
import './index.less';

interface IconTypes {
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
