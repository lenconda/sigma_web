import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import TreeView from '@material-ui/lab/TreeView';
import TreeItem from '@material-ui/lab/TreeItem';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { TaskListItem } from '../TaskListItem';
import './index.less';

export interface TaskSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelectTask: (task: TaskListItem) => void;
}

export interface TaskSelectorMenuItem extends TaskListItem {
  children: TaskSelectorMenuItem[];
}

// TODO: Mock
const getItems = (count: number, id: string): TaskSelectorMenuItem[] => Array.from({ length: count }, (v, k) => k).map(k => ({
  taskId: Math.random().toString(32),
  content: Math.random().toString(32),
  deadline: new Date().toISOString(),
  originalDeadline: new Date().toISOString(),
  order: k,
  finished: false,
  parentTaskId: id,
  children: [],
}));

const generateTaskMenu = async (): Promise<TaskSelectorMenuItem[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(getItems(10, '0'));
    }, 1000);
  });
};

const TaskSelector: React.FC<TaskSelectorProps> = ({
  visible,
  onClose,
  onSelectTask,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [menus, setMenus] = useState<TaskSelectorMenuItem[]>([]);
  const [selectedTask, setSelectedTask] = useState<TaskListItem | undefined>(undefined);
  const [expanded, setExpanded] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      setLoading(true);
      generateTaskMenu().then(res => setMenus(res)).finally(() => setLoading(false));
    }
  }, [visible]);

  const renderTree = (menuItem: TaskSelectorMenuItem, currentIndex: string) => (
    <TreeItem
      key={currentIndex}
      nodeId={`${currentIndex}`}
      label={
        <div className="text-wrapper">
          <Typography noWrap={true} variant="caption">{menuItem.content}</Typography>
        </div>
      }
      classes={{ label: 'tree-view__item__label', selected: 'tree-view__item--selected' }}
      onIconClick={() => {
        if (expanded.indexOf(currentIndex) === -1) {
          setLoading(true);
          generateTaskMenu().then(res => {
            const currentMenus = Array.from(menus);
            const indexes = currentIndex.split('-');
            const firstIndexMenu = currentMenus[indexes.shift()];
            const currentSelectedTaskMenu: TaskSelectorMenuItem | undefined = indexes.length === 0
              ? firstIndexMenu
              : indexes.reduce<TaskSelectorMenuItem>((result, key) => {
                if (result) {
                  return result.children[key] || null;
                }
                return null;
              }, firstIndexMenu);
            if (currentSelectedTaskMenu) {
              currentSelectedTaskMenu.children = res;
            }
            setMenus(currentMenus);
          }).finally(() => setLoading(false));
        }
      }}
      onLabelClick={event => {
        event.preventDefault();
        const currentTaskItem = Object.keys(menuItem).reduce<TaskListItem>((result, key) => {
          if (key !== 'children') {
            result[key] = menuItem[key];
          }
          return result;
        }, {} as TaskListItem);
        setSelectedTask(currentTaskItem);
      }}
    >
      <TreeItem nodeId="placeholder"></TreeItem>
      {
        (Array.isArray(menuItem.children) && menuItem.children.length !== 0)
          && menuItem.children.map((menuItem1, currentIndex1) => renderTree(menuItem1, `${currentIndex}-${currentIndex1}`))
      }
    </TreeItem>
  );

  return (
    <Dialog open={visible} fullWidth={true} classes={{ root: 'task-selector' }}>
      <div className="task-selector__title">
        <Typography noWrap={true} variant="subtitle1">
          {
            loading
              ? '请稍候...'
              : `移动任务${selectedTask && `至：${selectedTask.content}` || ''}`
          }
        </Typography>
      </div>
      <DialogContent classes={{ root: 'task-selector__content' }}>
        <TreeView
          className="tree-view"
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
          expanded={expanded}
          onNodeToggle={(event, nodeIds) => {
            event.preventDefault();
            setExpanded(nodeIds);
          }}
        >
          {
            menus.map((menu, index) => renderTree(menu, index.toString()))
          }
        </TreeView>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">放弃</Button>
        <Button
          variant="outlined"
          disabled={!selectedTask}
          onClick={() => {
            onClose();
            onSelectTask(selectedTask);
          }}
        >
          好
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskSelector;
