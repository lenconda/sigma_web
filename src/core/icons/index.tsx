import React from 'react';
import './iconfont.css';

export interface IconProps {
  fontSize?: number;
  className?: string;
  style?: React.CSSProperties;
}

const generateIcon = (name: string): React.FC<IconProps> => {
  return ({
    fontSize = 16,
    className = '',
    style = {},
  }) => <i
    className={`iconfont sg_${name}${className ? ` ${className}` : ''}`}
    style={{ ...style, fontSize }}
  ></i>;
};

const DeleteIcon = generateIcon('delete');
const DragIcon = generateIcon('drag');
const MoveIcon = generateIcon('move');
const ProgressIcon = generateIcon('progress');
const FinishIcon = generateIcon('finish');
const ListIcon = generateIcon('list');
const RefreshIcon = generateIcon('refresh');
const NotificationIcon = generateIcon('notification');

export {
  DeleteIcon,
  DragIcon,
  MoveIcon,
  ProgressIcon,
  FinishIcon,
  ListIcon,
  RefreshIcon,
  NotificationIcon,
};
