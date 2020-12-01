import React from 'react';
import Draggable from 'react-draggable';
import {
  BackdropProps,
  DialogClassKey,
  PaperProps,
} from '@material-ui/core';
import Paper from '@material-ui/core/Paper';
import Dialog from '@material-ui/core/Dialog';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import './index.less';

type ClassKey = Partial<Record<DialogClassKey, string>>;

export interface DraggableDialogProps {
  children: React.ReactNode;
  open: boolean;
  title?: string;
  fullWidth?: boolean;
  classes?: ClassKey;
  titleClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  BackdropProps?: Partial<BackdropProps>;
  PaperProps?: Partial<PaperProps>;
  onClose: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const PaperComponent = (props: PaperProps) => {
  return <Draggable handle=".app-dialog__title" cancel={'[class*="MuiDialogContent-root"]'}>
    <Paper {...props} />
  </Draggable>;
};

const DraggableDialog: React.FC<DraggableDialogProps> = ({
  children,
  open,
  title = '',
  fullWidth = true,
  classes = {},
  titleClassName = '',
  BackdropProps = {
    classes: {
      root: 'app-dialog__backdrop',
    },
  },
  PaperProps = {
    classes: {
      elevation24: 'app-dialog__paper',
    },
  },
  onClose,
}) => {
  const mergeClasses = (defaultClasses: ClassKey, customClasses: ClassKey): ClassKey => {
    return Object.keys(defaultClasses).reduce<ClassKey>((result, key) => {
      const defaultValue = defaultClasses[key];
      const customValue = customClasses[key] || '';
      result[key] = `${defaultValue}${(customValue && defaultValue !== customValue) ? ` ${customValue}` : ''}`;
      return result;
    }, {} as ClassKey);
  };

  return <Dialog
    open={open}
    fullWidth={fullWidth}
    classes={mergeClasses({ root: 'app-dialog' }, classes)}
    aria-labelledby="app-dialog__title"
    PaperComponent={PaperComponent}
    BackdropProps={BackdropProps}
    PaperProps={PaperProps}
  >
    <div className={`app-dialog__title${titleClassName && ` ${titleClassName}` || ''}`}>
      <Typography noWrap={true} variant="subtitle1">{title}</Typography>
      <button className="app-dialog__title__close-button" onClick={onClose}>
        <CloseIcon fontSize="small" />
      </button>
    </div>
    {children}
  </Dialog>;
};

export default DraggableDialog;
