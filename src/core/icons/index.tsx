import React from 'react';
import { IconProps } from '../../interfaces';
import './iconfont.css';
import './index.less';

const generateIcon = (name: string): React.FC<IconProps> => {
  return ({
    fontSize = 16,
    className = '',
    style = {},
    spin = false,
    spinDuration: animationDuration = '1s',
  }) => <i
    className={`iconfont sg_${name}${className && ` ${className}` || ''}${spin && ' spin' || ''}`}
    style={{ ...style, fontSize, animationDuration: spin ? animationDuration : 'none' }}
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
const LoadingIcon = generateIcon('loading');

export {
  DeleteIcon,
  DragIcon,
  MoveIcon,
  ProgressIcon,
  FinishIcon,
  ListIcon,
  RefreshIcon,
  NotificationIcon,
  LoadingIcon,
};
