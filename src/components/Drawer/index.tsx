import React, {
  useState,
  useEffect,
} from 'react';
import {
  BackdropClassKey,
  PaperClassKey,
} from '@material-ui/core';
import MuiDrawer from '@material-ui/core/Drawer';
import {
  mergeClasses,
} from '../../utils/class';
import './index.less';

type BackdropPartialClassKey = Partial<Record<BackdropClassKey, string>>;
type PaperPartialClassKey = Partial<Record<PaperClassKey, string>>;

export interface DrawerProps {
  children: React.ReactNode;
  anchor?: 'top' | 'right' | 'bottom' | 'left';
  trigger?: () => React.ReactNode;
  triggerClass?: string;
  open?: boolean;
  backdropClass?: BackdropPartialClassKey;
  paperClass?: PaperPartialClassKey;
  onClose?: () => void;
}

export interface TriggerProps {
  onClick: (event: React.MouseEvent<HTMLElement, MouseEvent>) => any;
}

const Drawer: React.FC<DrawerProps> = ({
  children,
  trigger = () => <button>trigger</button>,
  open = false,
  anchor = 'left',
  triggerClass = '',
  paperClass = {},
  backdropClass = {},
  onClose,
}) => {
  return (
    <div>
      <div
        className={`app-drawer__trigger-wrapper${triggerClass && ` ${triggerClass}` || ''}`}
      >
        {trigger()}
      </div>
      <MuiDrawer
        open={open}
        anchor={anchor}
        onClose={onClose}
        BackdropProps={{
          classes: mergeClasses<BackdropPartialClassKey>({
            root: 'app-drawer__backdrop',
          }, backdropClass),
          onClick: onClose,
        }}
        PaperProps={{
          classes: mergeClasses<PaperPartialClassKey>({
            elevation16: 'app-drawer__paper',
          }, paperClass),
        }}
      >
        {children}
      </MuiDrawer>
    </div>
  );
};

export default Drawer;
