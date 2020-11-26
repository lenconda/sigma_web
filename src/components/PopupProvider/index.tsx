import React, {
  useState,
  useRef,
} from 'react';
import Popper from '@material-ui/core/Popper';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import './index.less';

export interface PopupProviderProps {
  trigger: JSX.Element;
  children: React.ReactChild;
  id?: string;
  triggerClass?: string;
}

const PopupProvider: React.FC<PopupProviderProps> = ({
  trigger,
  id = Date.now().toString(),
  children,
  triggerClass = '',
}) => {
  const triggerRef = useRef(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  return (
    <ClickAwayListener onClickAway={() => setPopupVisible(false)}>
      <div>
        <div
          className={`app-popup__trigger-wrapper${triggerClass && ` ${triggerClass}` || ''}`}
          ref={triggerRef}
          onClick={() => setPopupVisible(true)}
        >
          {(() => trigger)()}
        </div>
        <Popper
          id={id}
          open={popupVisible}
          anchorEl={triggerRef.current}
          className="app-popup"
        >
          <div className="app-popup__popup-wrapper__content">
            {children}
          </div>
        </Popper>
      </div>
    </ClickAwayListener>
  );
};

export default PopupProvider;
