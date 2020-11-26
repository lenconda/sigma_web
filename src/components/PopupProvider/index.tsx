import React, {
  useState,
  useRef,
} from 'react';
import Popover, {
  PopoverOrigin,
} from '@material-ui/core/Popover';
import './index.less';

export interface PopupProviderProps {
  trigger: JSX.Element;
  children: React.ReactChild;
  id?: string;
  anchorOrigin?: PopoverOrigin;
  transformOrigin?: PopoverOrigin;
  popupClass?: string;
  triggerClass?: string;
}

const PopupProvider: React.FC<PopupProviderProps> = ({
  trigger,
  id = Date.now().toString(),
  children,
  anchorOrigin = {
    vertical: 'bottom',
    horizontal: 'center',
  },
  transformOrigin = {
    vertical: 'top',
    horizontal: 'center',
  },
  popupClass = '',
  triggerClass = '',
}) => {
  const triggerRef = useRef(null);
  const [popupVisible, setPopupVisible] = useState<boolean>(false);

  const paperClassString = `app-popup__popup-wrapper--paper${popupClass && `${popupClass}` || ''}`;

  return (
    <div>
      <div
        className={`app-popup__trigger-wrapper${triggerClass && ` ${triggerClass}` || ''}`}
        ref={triggerRef}
        onClick={() => setPopupVisible(true)}
      >
        {(() => trigger)()}
      </div>
      <Popover
        id={id}
        open={popupVisible}
        anchorEl={triggerRef.current}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        onClose={() => setPopupVisible(false)}
        classes={{
          paper: paperClassString,
        }}
      >
        <div className="app-popup__popup-wrapper__content">
          {children}
        </div>
      </Popover>
    </div>
  );
};

export default PopupProvider;
