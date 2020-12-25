import { NodeDragEventParams } from 'rc-tree/lib/contextTypes';
import {
  DataNode,
  EventDataNode,
} from 'rc-tree/es/interface';
import Bus from '../../core/bus';
import { Dispatch } from '../common';
import { TaskListItem } from './task_list_item';

export interface TasksTreeProps extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  bus: Bus<Dispatch>;
}

export type TraverseTreeNodeCallbackType = (item: DataNode, index: number, currentArray: DataNode[]) => void;

export type TasksTreeDropInfo = NodeDragEventParams<HTMLDivElement> & {
  dragNode: EventDataNode;
  dragNodesKeys: React.ReactText[];
  dropPosition: number;
  dropToGap: boolean;
};

export interface TreeNodeIdIndexMap {
  [key: string]: string;
}

export interface TasksTreeNodeItem extends TaskListItem {
  children?: TasksTreeNodeItem[];
}

