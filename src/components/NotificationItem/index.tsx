import React, {
  useState,
  useEffect,
} from 'react';
import {
  NotificationItemProps,
  NotificationDetailInfo,
} from '../../interfaces';
import moment from 'moment';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import DraggableDialog from '../DraggableDialog';
import {
  getNotificationDetailInfo,
} from '../../services/notifications';
import './index.less';

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  className = '',
  onClick,
}) => {
  const {
    subject,
    sender,
    checked,
    title,
    time,
    notificationId,
  } = notification;
  const [notificationDetailVisible, setNotificationDetailVisible] = useState<boolean>(false);
  const [notificationDetailInfo, setNotificationDetailInfo] = useState<NotificationDetailInfo>(undefined);
  const [notificationDetailInfoLoading, setNotificationDetailInfoLoading] = useState<boolean>(false);

  useEffect(() => {
    setNotificationDetailInfoLoading(true);
    getNotificationDetailInfo(notificationId).then(res => {
      setNotificationDetailInfo(res);
    }).finally(() => setNotificationDetailInfoLoading(false));
  }, []);

  return (
    <>
      <div
        className={`app-notification-item${!checked && ' unchecked' || ''}${className && ` ${className}` || ''}`}
        onClick={event => {
          if (onClick && typeof onClick === 'function') {
            onClick(event);
          }
          setNotificationDetailVisible(true);
        }}
      >
        <Typography
          variant="subtitle1"
          classes={{ subtitle1: 'title' }}
          noWrap={true}
        >
          {title}
        </Typography>
        <Typography variant="caption" noWrap={true} color="textSecondary">
          {
            sender && <>{sender.name || sender.email}</>
          }
          &nbsp;发送于&nbsp;
          {moment(time).format('YYYY-MM-DD HH:mm')}
        </Typography>
        <Typography variant="body2">{subject}</Typography>
      </div>
      <DraggableDialog
        open={notificationDetailVisible}
        onClose={() => setNotificationDetailVisible(false)}
        title={
          notificationDetailInfoLoading
            ? '请稍候...'
            : (notificationDetailInfo && notificationDetailInfo.title || '')
        }
      >
        {
          (!!notificationDetailInfo && !notificationDetailInfoLoading)
          && <div className="app-notification-item__content">
            <div className="info-wrapper">
              {
                notificationDetailInfo.sender
                && <Tooltip title={notificationDetailInfo.sender.email} arrow={true}>
                  <div className="user-info">
                    <img src={notificationDetailInfo.sender.avatar} alt="avatar" />
                    <span>{notificationDetailInfo.sender.name || notificationDetailInfo.sender.email}</span>
                  </div>
                </Tooltip>
              }
              <div className="time-info">{moment(notificationDetailInfo.time).format('YYYY-MM-DD HH:mm:ss')}</div>
            </div>
            <div
              className="content-wrapper"
              dangerouslySetInnerHTML={{
                __html: notificationDetailInfo.content || '',
              }}
            ></div>
            <div className="foot-wrapper">
              <Button
                variant="outlined"
                className="app-button"
                onClick={() => setNotificationDetailVisible(false)}
              >
                好
              </Button>
            </div>
          </div>
        }
      </DraggableDialog>
    </>
  );
};

export default NotificationItem;
