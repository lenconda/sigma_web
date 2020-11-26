import React from 'react';
import {
  DragIcon,
  MoveIcon,
  ProgressIcon,
  DeleteIcon,
  FinishIcon,
} from '../../core/icons';
import './index.less';

interface IconTypes {
  drag: typeof DragIcon;
  move: typeof MoveIcon;
  progress: typeof ProgressIcon;
  delete: typeof DeleteIcon;
  finish: typeof FinishIcon;
}

export interface IconButtonProps {
  type: keyof IconTypes;
  className?: string;
  size?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  style?: React.CSSProperties;
  iconClasses?: string[];
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const {
    type,
    className = '',
    size = 16,
    onClick,
    style = {},
    iconClasses = [],
  } = props;

  const icons: IconTypes = {
    drag: DragIcon,
    move: MoveIcon,
    progress: ProgressIcon,
    delete: DeleteIcon,
    finish: FinishIcon,
  };

  const Icon = icons[type];

  return <button
    onClick={onClick}
    ref={ref}
    className={`icon-button${className ? ` ${className}` : ''}`}
  >
    <Icon className={iconClasses.join(' ')} fontSize={size} style={style} />
  </button>;
});

export default IconButton;
