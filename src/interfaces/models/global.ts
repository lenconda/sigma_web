import {
  User,
  NotificationInfo,
} from '../common';
import { Reducer } from 'redux';
import {
  Effect,
  Subscription,
} from 'dva';
import Bus from '../../core/bus';
import {
  Dispatch,
  PaginationConfig,
} from '../../interfaces';

export interface GlobalState {
  profile?: User;
  notifications: NotificationInfo[];
  hasMoreNotifications: boolean;
  notificationPagination: PaginationConfig;
  fetchNotificationsLoading: boolean;
  dateRange: [Date, Date];
  currentActiveTaskIds: string[];
  bus: Bus<Dispatch>;
  smallWidth: boolean;
  currentTemplateId: string;
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalState;
  effects: {
    fetchNotifications: Effect;
  };
  reducers: {
    setProfile: Reducer<GlobalState>;
    setDateRange: Reducer<GlobalState>;
    setCurrentActiveTaskIds: Reducer<GlobalState>;
    setNotifications: Reducer<GlobalState>;
    setHasMoreNotifications: Reducer<GlobalState>;
    setSmallWidth: Reducer<GlobalState>;
    setNotificationPagination: Reducer<GlobalState>;
    setFetchNotificationsLoading: Reducer<GlobalState>;
    setCurrentTemplateId: Reducer<GlobalState>;
  };
  subscriptions: {
    setup: Subscription;
  };
}
