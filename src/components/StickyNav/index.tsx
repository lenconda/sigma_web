import React, {
  useState,
  useEffect,
  useRef,
} from 'react';
import './index.less';

export interface StickyNavProps {
  className?: string;
  zIndex?: number;
  children: React.ReactChild;
}

const StickyNav: React.FC<StickyNavProps> = ({
  className = '',
  children,
  zIndex = 999,
}) => {
  const [sticky, setSticky] = useState<boolean>(false);
  const [placeholderHeight, setPlaceholderHeight] = useState<number>(0);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event: Event) => {
      setPlaceholderHeight(ref.current.clientHeight || 0);
      setSticky(window.scrollY !== 0);
    };
    window.addEventListener('scroll', handler);
    return () => {
      window.removeEventListener('scroll', handler);
    };
  }, [ref]);

  return (
    <>
      <nav
        ref={ref}
        className={`app-sticky-nav${className && ` ${className}` || ''}${sticky && ' sticky' || ''}`}
        style={{ zIndex }}
      >
        {children}
      </nav>
      {
        sticky
          && <div
            className="app-sticky-nav--placeholder"
            style={{ minHeight: placeholderHeight }}
          ></div>
      }
    </>
  );
};

export default StickyNav;
