import React from 'react';

export interface TreeNodeData {
  children?: TreeNodeData[];
  key: React.ReactText;
}

export interface TreeProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement> {
  data?: TreeNodeData[];
}

export interface TreeNodeProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
  treeNodeData: TreeNodeData;
  isLeaf?: boolean;
  onDragPrepared?: (key: string, element: HTMLElement, event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
}
