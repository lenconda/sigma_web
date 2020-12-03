import {
  BackdropClassKey,
  PaperClassKey,
} from '@material-ui/core';

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
