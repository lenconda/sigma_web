import React, {
  useEffect,
  useState,
  useRef,
} from 'react';
import { DropContextProps } from '../../interfaces';

const DropContext: React.FC<DropContextProps> = ({
  className = '',
  children,
  onDrop,
  ...props
}) => {
  const [top, setTop] = useState<number>(0);
  const [right, setRight] = useState<number>(0);
  const [bottom, setBottom] = useState<number>(0);
  const [left, setLeft] = useState<number>(0);
  const ref = useRef(undefined);

  useEffect(() => {
    const offsetTop = ref.current.offsetTop || 0;
    const offsetLeft = ref.current.offsetLeft || 0;
    const clientWidth = ref.current.clientWidth || 0;
    const clientHeight = ref.current.clientHeight || 0;
    setTop(offsetTop);
    setLeft(offsetLeft);
    setBottom(offsetTop + clientHeight);
    setRight(offsetLeft + clientWidth);

    const dragHandler = (event: DragEvent) => {
      console.log(event.clientX, event.clientY);
    };

    const dragOverHandler = (event: DragEvent) => {
      event.preventDefault();
    };

    window.addEventListener('drag', dragHandler);
    window.addEventListener('dragover', dragOverHandler);

    return () => {
      window.removeEventListener('drag', dragHandler);
      window.removeEventListener('dragover', dragOverHandler);
    };
  }, [ref]);

  return (
    <div className={className && className || ''} ref={ref} {...props}></div>
  );
};

export default DropContext;
