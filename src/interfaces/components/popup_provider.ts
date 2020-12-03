export interface PopupProviderProps {
  trigger: JSX.Element;
  children: React.ReactNode;
  id?: string;
  triggerClass?: string;
  zIndex?: number;
  open?: boolean;
  disablePortal?: boolean;
  closeOnClick?: boolean;
  className?: string;
  onOpen?: () => void;
  onClose?: () => void;
}
