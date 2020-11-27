import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import './index.less';

export interface PopupProviderProps {
  trigger: JSX.Element;
  children: React.ReactChild;
  id?: string;
  triggerClass?: string;
  zIndex?: number;
  open?: boolean;
  disablePortal?: boolean;
  closeOnClick?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

const PopupProvider: React.FC<PopupProviderProps> = ({
  trigger,
  id = Date.now().toString(),
  children,
  triggerClass = '',
  zIndex = 9999,
  open = false,
  disablePortal = false,
  closeOnClick = false,
  onOpen,
  onClose,
}) => {
  const triggerRef = useRef(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  const handleClose = () => {
    setPopupVisible(false);
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  useEffect(() => {
    setPopupVisible(open);
  }, [open]);

  return (
    <ClickAwayListener onClickAway={() => handleClose()}>
      <div>
        <div
          className={`app-popup__trigger-wrapper${triggerClass && ` ${triggerClass}` || ''}`}
          ref={triggerRef}
          onClick={() => {
            setPopupVisible(true);
            if (onOpen) {
              onOpen();
            }
          }}
        >
          {(() => trigger)()}
        </div>
        <Popper
          id={id}
          open={popupVisible}
          anchorEl={triggerRef.current}
          className="app-popup"
          style={{ zIndex }}
          disablePortal={disablePortal}
        >
          <div className="app-popup__popup-wrapper__content" onClick={() => closeOnClick && handleClose()}>
            {children}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default PopupProvider;
