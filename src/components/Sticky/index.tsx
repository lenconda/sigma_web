import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import './index.less';

export interface StickyProps {
  className?: string;
  zIndex?: number;
  children: React.ReactNode;
  direction?: 'vertical' | 'horizontal';
}

const Sticky: React.FC<StickyProps> = ({
  className = '',
  children,
  zIndex = 999,
  direction = 'vertical',
}) => {
  const [sticky, setSticky] = useState<boolean>(false);
  const [placeholderHeight, setPlaceholderHeight] = useState<number>(0);
  const [placeholderWidth, setPlaceholderWidth] = useState<number>(0);
  const ref = useRef(null);

  const getCustomStyle = (): React.CSSProperties => {
    if (direction === 'vertical') {
      return {
        minHeight: placeholderHeight,
      };
    } else if (direction === 'horizontal') {
      return {
        minWidth: placeholderWidth,
      };
    }
    return {};
  };

  useEffect(() => {
    const handler = (event: Event) => {
      setPlaceholderHeight(ref.current.clientHeight || 0);
      setPlaceholderWidth(ref.current.clientWidth || 0);
      if (direction === 'vertical') {
        setSticky(window.scrollY !== 0);
      } else {
        setSticky(window.scrollX !== 0);
      }
    };
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, [ref, direction]);

  return (
    <>
      <nav
        ref={ref}
        className={`app-sticky-nav${className && ` ${className}` || ''}${sticky && ` sticky ${direction}` || ''}`}
        style={{ zIndex }}
      >
        {
          React.Children.map(children, child => {
            if (!React.isValidElement(child)) { return null }
            return React.cloneElement(child, child.props);
          })
        }
      </nav>
      {
        sticky
          && <div
            className="app-sticky-nav--placeholder"
            style={getCustomStyle()}
          ></div>
      }
    </>
  );
};

export default Sticky;
