import {
  BackdropProps,
  DialogClassKey,
  PaperProps,
} from '@material-ui/core';

type DialogPartialClassKey = Partial<Record<DialogClassKey, string>>;

export interface DraggableDialogProps {
  children: React.ReactNode;
  open: boolean;
  title?: string;
  fullWidth?: boolean;
  classes?: DialogPartialClassKey;
  titleClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  BackdropProps?: Partial<BackdropProps>;
  PaperProps?: Partial<PaperProps>;
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}
