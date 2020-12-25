import React, {
  useState,
  useEffect,
} from 'react';
import Tree from 'rc-tree';
import { DataNode } from 'rc-tree/es/interface';
import { getTaskListFromTask } from '../../services/task';
import {
  TasksTreeProps,
  TraverseTreeNodeCallbackType,
  TasksTreeDropInfo,
  TreeNodeIdIndexMap,
  TasksTreeNodeItem,
} from '../../interfaces';

const TasksTree: React.FC<TasksTreeProps> = ({
  className = '',
  bus,
}) => {
  const [treeDataNodes, setTreeDataNodes] = useState<DataNode[]>([]);
  const [tasks, setTasks] = useState<TasksTreeNodeItem[]>([]);
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [treeNodeMap, setTreeNodeMap] = useState<TreeNodeIdIndexMap>(undefined);

  const getTreeNodeByIndex = (treeNodes: TasksTreeNodeItem[], index: string) => {
    const indexes = index.split('-');
    let treeNode: TasksTreeNodeItem = treeNodes[indexes.unshift()];
    while (indexes.length !== 0) {
      treeNode = (treeNode && treeNode.children || [])[indexes.unshift()];
    }
    return treeNode;
  };

  const getFirstLevelChildTasks = async (tasks: TasksTreeNodeItem[]) => {
    const result = [];
    for (let task of tasks) {
      task.children = (await getTaskListFromTask(task.taskId, 6)) || [];
      result.push(task);
    }
    return result;
  };

  const fetchTasks = (taskId = 'default') => {
    setTasksLoading(true);
    getTaskListFromTask(taskId, 6).then(items => {
      setTasks(items);
      // getFirstLevelChildTasks(items).then(res => {
      //   if (taskId === 'default') {
      //     setTasks(res);
      //   } else {
      //     console.log(treeNodeMap[taskId]);
      //     const currentTasks = Array.from(tasks);
      //     const currentTaskNode = getTreeNodeByIndex(currentTasks, treeNodeMap[taskId] || '');
      //     if (currentTaskNode) {
      //       currentTaskNode.children = res;
      //     }
      //     setTasks(currentTasks);
      //   }
      // }).finally(() => setTasksLoading(false));
    });
  };

  const transformTreeDataNodes = (tasks: TasksTreeNodeItem[]) => {
    if (!tasks) {
      return;
    }
    const treeDataNodes = tasks.map(task => ({
      title: task.content,
      key: task.taskId,
      children: transformTreeDataNodes(task.children),
    }));
    return treeDataNodes;
  };

  const transformTreeNodeMap = (tasks: TasksTreeNodeItem[], currentIndexes: number[]) => {
    if (!tasks) { return }
    let result = {};
    tasks.forEach((task, index) => {
      result[task.taskId] = currentIndexes.concat(index).join('-');
      if (task.children && task.children.length > 0) {
        result = {
          ...result,
          ...transformTreeNodeMap(task.children, currentIndexes.concat(index)),
        };
      }
    });
    return result;
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    setTreeDataNodes(transformTreeDataNodes(tasks));
    setTreeNodeMap(transformTreeNodeMap(tasks, []));
  }, [tasks]);

  const handleDropTaskItem = (info: TasksTreeDropInfo) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPositionArray = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPositionArray[dropPositionArray.length - 1]);

    const traverseTreeNodes = (data: DataNode[], key: React.ReactText, callback: TraverseTreeNodeCallbackType) => {
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
      onExpand={data => {
        if (data.length > 0) {
          fetchTasks(data[0].toString());
        }
      }}
      onDragStart={data => console.log(data)}
    />
  );
};

export default TasksTree;
