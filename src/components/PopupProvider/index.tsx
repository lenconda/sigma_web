import React, {
  useState,
  useRef,
  useEffect,
} from 'react';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import {
  PopupProviderProps,
} from '../../interfaces';
import './index.less';

const PopupProvider: React.FC<PopupProviderProps> = ({
  trigger,
  id = Date.now().toString(),
  children,
  triggerClass = '',
  zIndex = 9999,
  open = false,
  disablePortal = false,
  closeOnClick = false,
  className = '',
  onOpen,
  onClose,
}) => {
  const triggerRef = useRef(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  const handleClose = () => {
    if (closeOnClick) {
      setPopupVisible(false);
    }
    if (onClose && typeof onClose === 'function') {
      onClose();
    }
  };

  useEffect(() => {
    setPopupVisible(open);
  }, [open]);

  return (
    <ClickAwayListener onClickAway={handleClose}>
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
          className={`app-popup${className && ` ${className}` || ''}`}
          style={{ zIndex }}
          disablePortal={disablePortal}
          onClick={() => setPopupVisible(true)}
        >
          <div className="app-popup__popup-wrapper__content" onClick={() => closeOnClick && handleClose()}>
            {
              React.Children.map(children, child => {
                if (!React.isValidElement(child)) { return null }
                return React.cloneElement(child, child.props);
              })
            }
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default PopupProvider;
