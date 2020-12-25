import React, {
  useState,
  useEffect,
} from 'react';
import TreeNode from './TreeNode';
import {
  TreeProps,
  TreeNodeData,
} from './interfaces';
import './index.less';

const Tree: React.FC<TreeProps> = ({
  data: treeNodes = [],
}) => {
  const renderTreeNodes = (treeNodes: TreeNodeData[]) => {
    return treeNodes.map((treeNode, index) => {
      const currentTreeNodeChildren = treeNode.children;
      if (Array.isArray(currentTreeNodeChildren)) {
        return <TreeNode key={index} treeNodeData={treeNode} isLeaf={false}>
          <TreeNode treeNodeData={treeNode} isLeaf={true} data-tree-key={treeNode.key}>
            {treeNode.key}
          </TreeNode>
          <div style={{ paddingLeft: 20 }}>
            {renderTreeNodes(currentTreeNodeChildren)}
          </div>
        </TreeNode>;
      } else {
        return <TreeNode key={index} treeNodeData={treeNode} isLeaf={true} data-tree-key={treeNode.key}>
          {treeNode.key}
        </TreeNode>;
      }
    });
  };

  return (
    <ul className="lenconda-tree">
      {renderTreeNodes(treeNodes)}
    </ul>
  );
};

export default Tree;
