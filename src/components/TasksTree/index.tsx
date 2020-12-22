import React, {
  useState,
  useEffect,
} from 'react';
import Tree from 'rc-tree';
import { DataNode, EventDataNode } from 'rc-tree/es/interface';
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

    // console.log 1 => item: parent
    // console.log 2 => item: last sibling
    if (dropPosition === 0) {
      // Drop on the content
      traverseTreeNodes(currentTreeData, dropKey, item => {
        console.log(1, item);
        // eslint-disable-next-line no-param-reassign
        item.children = item.children || [];
        // where to insert 示例添加到尾部，可以是随意位置
        item.children.unshift(draggingItem);
      });
    } else {
      traverseTreeNodes(currentTreeData, dropKey, (item, index, currentArray) => {
        currentArray.splice(dropPosition === -1 ? index : index + 1, 0, draggingItem);
        console.log(2, item);
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
