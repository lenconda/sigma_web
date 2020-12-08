import React, {
  useState,
  useEffect,
} from 'react';
import { connect } from 'dva';
import {
  useHistory,
  useLocation,
} from 'react-router-dom';
import PopupProvider from '../../../components/PopupProvider';
import MenuList from '@material-ui/core/MenuList';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {
  updateSearch,
  deleteSearch,
} from '../../../utils/url';
import { getTemplateList } from '../../../services/templates';
import {
  TemplateIcon,
  ArrowDownIcon,
} from '../../../core/icons';
import IconButton from '../../../components/IconButton';
import { getSummary } from '../../../services/summary';
import { SummaryPageProps } from '../../../interfaces/pages/home/summary';
import {
  TemplateBase,
  PaginationConfig,
} from '../../../interfaces';
import { ConnectState } from '../../../interfaces/models';
import './index.less';

const Summary: React.FC<SummaryPageProps> = ({
  currentActiveTaskIds,
  dateRange,
  currentTemplateId,
}) => {
  const [templateMenuVisible, setTemplateMenuVisible] = useState<boolean>(false);
  const [templateItems, setTemplateItems] = useState<TemplateBase[]>([]);
  const [templateItemsPagination, setTemplateItemsPagination] = useState<PaginationConfig>({ current: 1, size: 10 });
  const [currentSelectedTemplate, setCurrentSelectedTemplate] = useState<TemplateBase>(undefined);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateBase>(undefined);
  const [moreTemplateItems, setMoreTemplateItems] = useState<boolean>(false);
  const [templateItemsLoading, setTemplateItemsLoading] = useState<boolean>(false);
  const [summaryContent, setSummaryContent] = useState<string>('');
  const [summaryContentLoading, setSummaryContentLoading] = useState<boolean>(false);
  const history = useHistory();
  const location = useLocation();

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
    }).finally(() => setTemplateItemsLoading(false));
  };

  const fetchSummaryContent = () => {
    if (currentActiveTaskIds[0]) {
      setSummaryContent('');
      setSummaryContentLoading(true);
      getSummary(currentActiveTaskIds[0], dateRange).then(res => {
        setSummaryContent(res);
      }).finally(() => setSummaryContentLoading(false));
    }
  };

  useEffect(() => {
    if (!currentActiveTaskIds[0] || !dateRange || !currentTemplateId) {
      setSummaryContent('');
    } else {
      fetchSummaryContent();
    }
  }, [dateRange, currentActiveTaskIds, currentTemplateId]);

  useEffect(() => {
    fetchTemplateItems(templateItemsPagination);
  }, [templateItemsPagination]);

  useEffect(() => {
    if (!currentTemplateId && templateItems.length > 0) {
      history.push({
        ...location,
        search: updateSearch(location.search, { templateId: templateItems[0].templateId }),
      });
    }
    if (templateItems.length === 0) {
      history.push({
        ...location,
        search: deleteSearch(location.search, ['templateId']),
      });
    }
    if (currentTemplateId) {
      const template = templateItems.find(templateItem => templateItem.templateId === currentTemplateId);
      if (template) {
        setCurrentSelectedTemplate(template);
      } else {
        history.push({
          ...location,
          search: deleteSearch(location.search, ['templateId']),
        });
      }
    }
  }, [currentTemplateId, templateItems]);

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
          <Button
            size="small"
            className="app-button--link"
            onClick={() => {
              const { protocol, host } = window.location;
              const url = `${protocol}//${host}/settings/templates`;
              window.open(url);
            }}
          >
            管理我的模板
          </Button>
          <IconButton
            type="refresh"
            size={14}
            style={{ fontWeight: 700 }}
            spin={templateItemsLoading}
            disabled={templateItemsLoading}
            onClick={() => fetchTemplateItems({ ...templateItemsPagination, current: 1 })}
          />
        </div>
        <MenuList className="items-wrapper">
          {
            templateItems.length === 0 && (
              templateItemsLoading
                ? <div className="loading">请稍候...</div>
                : <div className="empty">没有模板</div>
            )
          }
          {
            templateItems.map((templateItem, index) => (
              <div key={index} onClick={() => setSelectedTemplate(templateItem)}>
                <MenuItem
                  className={
                    (selectedTemplate && selectedTemplate.templateId) === templateItem.templateId
                    ? ' selected'
                    : ''
                  }
                >
                  <TemplateIcon />
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
                history.push({
                  ...location,
                  search: updateSearch(location.search, { templateId: selectedTemplate.templateId }),
                });
              }}
            >
              好
            </Button>
          </div>
        }
      </PopupProvider>
      <div className="app-home-summary__page__content">
        {
          !summaryContentLoading && summaryContent !== ''
          && <textarea defaultValue={summaryContent} readOnly={true}></textarea>
        }
        {
          summaryContent === '' && (
            summaryContentLoading
            ? <span>请稍候...</span>
            : <span>暂无摘要</span>
          )
        }
      </div>
    </div>
  );
};

export default connect(({ global }: ConnectState) => global)(Summary);
