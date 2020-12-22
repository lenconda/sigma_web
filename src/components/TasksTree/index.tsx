import React, {
  useState,
  useEffect,
} from 'react';
import Tree, { DataNode, EventDataNode } from 'antd/lib/tree';
import { TasksTreeProps } from '../../interfaces';
import { NodeDragEventParams } from 'rc-tree/lib/contextTypes';

export type TaskTreeDropInfo = NodeDragEventParams<HTMLDivElement> & {
  dragNode: EventDataNode;
  dragNodesKeys: React.ReactText[];
  dropPosition: number;
  dropToGap: boolean;
};

export type TraverseCallbackType = (item: DataNode, index: number, currentArray: DataNode[]) => void;

const TasksTree: React.FC<TasksTreeProps> = ({
  className = '',
}) => {
  const [treeDataNodes, setTreeDataNodes] = useState<DataNode[]>([]);

  useEffect(() => {
    setTreeDataNodes([
      {
        title: '0',
        key: '0',
        children: [
          {
            title: '0-0',
            key: '0-0',
            children: [
              {
                title: '0-0-0',
                key: '0-0-0',
              },
              {
                title: '0-0-1',
                key: '0-0-1',
              },
              {
                title: '0-0-2',
                key: '0-0-2',
              },
            ],
          },
          {
            title: '0-1',
            key: '0-1',
            children: [
              {
                title: '0-1-0',
                key: '0-1-0',
              },
            ],
          },
          {
            title: '0-2',
            key: '0-2',
            children: [
              {
                title: '0-2-0',
                key: '0-2-0',
              },
              {
                title: '0-2-1',
                key: '0-2-1',
              },
            ],
          },
        ],
      },
      {
        title: '1',
        key: '1',
        children: [
          {
            title: '1-0',
            key: '1-0',
            children: [
              {
                title: '1-0-0',
                key: '1-0-0',
              },
              {
                title: '1-0-1',
                key: '1-0-1',
              },
              {
                title: '1-0-2',
                key: '1-0-2',
              },
            ],
          },
        ],
      },
    ]);
  }, []);

  const handleDropTaskItem = (info: TaskTreeDropInfo) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPositionArray = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPositionArray[dropPositionArray.length - 1]);

    const traverseTreeNodes = (data: DataNode[], key: React.ReactText, callback: TraverseCallbackType) => {
      for (let i = 0; i < data.length; i += 1) {
        if (data[i].key === key) {
          return callback(data[i], i, data);
        }
        if (data[i].children) {
          traverseTreeNodes(data[i].children, key, callback);
        }
      }
    };

    const currentTreeData = Array.from(treeDataNodes);

    let draggingItem: DataNode;

    traverseTreeNodes(currentTreeData, dragKey, (item, index, currentArray) => {
      currentArray.splice(index, 1);
      draggingItem = item;
    });

    // Drop directly on the task list item
    if (!info.dropToGap) {
      traverseTreeNodes(currentTreeData, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(draggingItem);
      });
      // Drop between items
    } else if (
      (info.node.children || []).length > 0
      && info.node.expanded
      && dropPosition === 1
    ) {
      traverseTreeNodes(currentTreeData, dropKey, item => {
        item.children = item.children || [];
        item.children.unshift(draggingItem);
      });
    } else {
      traverseTreeNodes(currentTreeData, dropKey, (item, index, currentArray) => {
        currentArray.splice(dropPosition === -1 ? index : index + 1, 0, draggingItem);
      });
    }

    setTreeDataNodes(currentTreeData);
  };

  return (
    <Tree
      treeData={treeDataNodes}
      className={className && ` ${className}` || ''}
      draggable={true}
      onDrop={handleDropTaskItem}
    />
  );
};

export default TasksTree;
