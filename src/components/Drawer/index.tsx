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
  variant?: 'permanent' | 'persistent' | 'temporary';
  trigger?: () => React.ReactNode;
  triggerClass?: string;
  stickyClass?: string;
  open?: boolean;
  backdropClass?: BackdropPartialClassKey;
  paperClass?: PaperPartialClassKey;
  hideThreshold?: number;
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
  stickyClass = '',
  paperClass = {},
  backdropClass = {},
  hideThreshold = 720,
  variant = 'permanent',
  onClose,
}) => {
  const [sticky, setSticky] = useState<boolean>(false);
  const [smallWidth, setSmallWidth] = useState<boolean>(false);

  const generateVariantState = (): 'permanent' | 'persistent' | 'temporary' => {
    if (variant === 'temporary') {
      return 'temporary';
    }
    if (sticky) {
      return 'permanent';
    }
    if (smallWidth) {
      return 'temporary';
    }
    return 'permanent';
  };

  useEffect(() => {
    const scrollHandler = () => {
      setSticky(window.scrollX !== 0 && !smallWidth);
    };
    const resizeHandler = () => {
      setSmallWidth(window.innerWidth < hideThreshold);
    };
    window.addEventListener('scroll', scrollHandler);
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('scroll', scrollHandler);
      window.removeEventListener('resize', resizeHandler);
    };
  }, [smallWidth]);

  useEffect(() => setSmallWidth(window.innerWidth < hideThreshold));

  return (
    <div>
      {
        (smallWidth || variant === 'temporary') &&
        <div
          className={`app-drawer__trigger-wrapper${triggerClass && ` ${triggerClass}` || ''}`}
        >
          {trigger()}
        </div>
      }
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
            elevation0: `app-drawer__paper${(stickyClass && sticky) && ` ${stickyClass}` || ''}`,
            elevation16: `app-drawer__paper${stickyClass && ` ${stickyClass}` || ''}`,
          }, paperClass),
        }}
        variant={generateVariantState()}
      >
        {children}
      </MuiDrawer>
    </div>
  );
};

export default Drawer;
