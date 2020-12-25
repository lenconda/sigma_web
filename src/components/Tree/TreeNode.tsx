import React, { useState, useEffect } from 'react';
import { TreeNodeProps } from './interfaces';

const TreeNode: React.FC<TreeNodeProps> = ({
  children,
  isLeaf = false,
  treeNodeData,
  onDragPrepared,
  ...props
}) => {
  const [dragging, setDragging] = useState<boolean>(false);
  const [mouseClientX, setMouseClientX] = useState<number>(0);
  const [mouseClientY, setMouseClientY] = useState<number>(0);
  const [relativeTop, setRelativeTop] = useState<number>(0);
  const [relativeLeft, setRelativeLeft] = useState<number>(0);

  useEffect(() => {
    const mousemoveHandler = (event: MouseEvent) => {
      if (dragging) {
        setMouseClientX(event.clientX);
        setMouseClientY(event.clientY);
      }
    };

    const mouseupHandler = (event: MouseEvent) => {
      setDragging(false);
      setMouseClientX(0);
      setMouseClientY(0);
    };

    window.addEventListener('mousemove', mousemoveHandler);
    window.addEventListener('mouseup', mouseupHandler);

    return () => {
      window.removeEventListener('mousemove', mousemoveHandler);
      window.removeEventListener('mouseup', mouseupHandler);
    };
  }, [dragging]);

  const treeNodeProps = {
    ...props,
    onMouseDown: (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
      const eventTarget = event.target as HTMLElement;
      const eventCurrentTarget = event.currentTarget as HTMLElement;
      const eventTargetKey = eventTarget.getAttribute('data-tree-key');
      const eventCurrentTargetKey = eventTarget.getAttribute('data-tree-key');
      if (
        !treeNodeData.children
        || (eventCurrentTarget.tagName.toUpperCase() === 'UL' && eventTargetKey === eventCurrentTargetKey)
      ) {
        event.stopPropagation();
        setMouseClientX(event.clientX);
        setMouseClientY(event.clientY);
        setRelativeTop(event.clientY - eventCurrentTarget.offsetTop);
        setRelativeLeft(event.clientX - eventCurrentTarget.offsetLeft);
        setDragging(true);
      }
    },
  };

  return isLeaf
    ? (
      <>
        <li {...(treeNodeProps as any)}>{children}</li>
        {
          dragging && <li
            {...(treeNodeProps as any)}
            style={{
              position: 'fixed',
              left: mouseClientX - relativeLeft,
              top: mouseClientY - relativeTop,
            }}
          >
            {children}
          </li>
        }
      </>
    )
    : (
      <>
        <ul {...(treeNodeProps as any)}>{children}</ul>
        {
          dragging && <ul
            {...(treeNodeProps as any)}
            style={{
              position: 'fixed',
              left: mouseClientX - relativeLeft,
              top: mouseClientY - relativeTop,
            }}
          >
            {children}
          </ul>
        }
      </>
    );
};

export default TreeNode;
