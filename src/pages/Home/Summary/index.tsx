import React, {
  useState,
  useEffect,
} from 'react';
import PopupProvider from '../../../components/PopupProvider';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { getTemplateList } from '../../../services/templates';
import {
  TemplateIcon,
  ArrowDownIcon,
} from '../../../core/icons';
import IconButton from '../../../components/IconButton';
import { SummaryPageProps } from '../../../interfaces/pages/home/summary';
import {
  TemplateBase,
  PaginationConfig,
} from '../../../interfaces';
import './index.less';

const Summary: React.FC<SummaryPageProps> = () => {
  const [templateMenuVisible, setTemplateMenuVisible] = useState<boolean>(false);
  const [templateItems, setTemplateItems] = useState<TemplateBase[]>([]);
  const [templateItemsPagination, setTemplateItemsPagination] = useState<PaginationConfig>({ current: 1, size: 10 });
  const [currentSelectedTemplate, setCurrentSelectedTemplate] = useState<TemplateBase>(undefined);
  const [templateSelectedTemplate, setTemplateSelectedTemplate] = useState<TemplateBase>(undefined);
  const [moreTemplateItems, setMoreTemplateItems] = useState<boolean>(false);
  const [templateItemsLoading, setTemplateItemsLoading] = useState<boolean>(false);

  const fetchTemplateItems = (pagination: PaginationConfig) => {
    setTemplateItemsLoading(true);
    getTemplateList(pagination).then(res => {
      const {
        total,
        items = [],
        current = pagination.current,
        size = pagination.size,
      } = res;
      setTemplateItems(pagination.current === 1 ? items : templateItems.concat(items));
      setMoreTemplateItems(total - current * size > 0);
      if (items.length > 0 && !currentSelectedTemplate) {
        setCurrentSelectedTemplate(items[0]);
        setTemplateSelectedTemplate(items[0]);
      } else if (items.length === 0) {
        setCurrentSelectedTemplate(undefined);
        setTemplateSelectedTemplate(undefined);
      }
    }).finally(() => setTemplateItemsLoading(false));
  };

  useEffect(() => {
    fetchTemplateItems(templateItemsPagination);
  }, [templateItemsPagination]);

  return (
    <div className="app-home-summary__page">
      <PopupProvider
        open={templateMenuVisible}
        onOpen={() => setTemplateMenuVisible(true)}
        trigger={
          <Button
            className="app-button"
            variant="outlined"
            startIcon={<TemplateIcon />}
            endIcon={<ArrowDownIcon />}
          >
            {(currentSelectedTemplate && currentSelectedTemplate.name) || '选择模板'}
          </Button>
        }
        closeOnClick={true}
        disablePortal={false}
        className="template-selector-wrapper"
      >
        <div className="header-wrapper">
          <Button size="small" className="app-button--link">管理我的模板</Button>
          <IconButton
            type="refresh"
            size={14}
            style={{ fontWeight: 700 }}
            spin={templateItemsLoading}
            disabled={templateItemsLoading}
            onClick={() => fetchTemplateItems(templateItemsPagination)}
          />
        </div>
        <MenuList className="items-wrapper">
          {
            templateItems.map((templateItem, index) => (
              <div key={index} onClick={() => setTemplateSelectedTemplate(templateItem)}>
                <MenuItem
                  className={
                    (templateSelectedTemplate && templateSelectedTemplate.templateId) === templateItem.templateId
                    ? ' selected'
                    : ''
                  }
                >
                  <Typography noWrap={true}>{templateItem.name}</Typography>
                </MenuItem>
              </div>
            ))
          }
          {
            moreTemplateItems
            && <Button
              fullWidth={true}
              className="app-button"
              disabled={templateItemsLoading}
              onClick={() => {
                const { current, size } = templateItemsPagination;
                setTemplateItemsPagination({
                  current: current + 1,
                  size,
                });
              }}
            >
              {templateItemsLoading ? '加载中...' : '加载更多'}
            </Button>
          }
        </MenuList>
        {
          templateItems.length > 0
          && <div className="footer-wrapper">
            <Button
              className="app-button"
              color="primary"
              fullWidth={true}
              variant="contained"
              disabled={!currentSelectedTemplate}
              onClick={() => {
                setTemplateMenuVisible(false);
                setCurrentSelectedTemplate(templateSelectedTemplate);
              }}
            >
              好
            </Button>
          </div>
        }
      </PopupProvider>
      <div className="summary-content"></div>
    </div>
  );
};

export default Summary;
