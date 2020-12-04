import {
  User,
  NotificationInfo,
} from '../common';
import { Reducer } from 'redux';
import {
  Effect,
} from 'dva';
import Bus from '../../core/bus';
import { Dispatch } from '../../interfaces';

export interface GlobalState {
  profile?: User;
  notifications: NotificationInfo[];
  dateRange: [Date, Date];
  currentActiveTaskIds: string[];
  bus: Bus<Dispatch>;
}

export interface GlobalModelType {
  namespace: 'global';
  state: GlobalState;
  effects: {
    effectSetInitialActiveTaskId: Effect;
  };
  reducers: {
    setProfile: Reducer<GlobalState>;
    setDateRange: Reducer<GlobalState>;
    setCurrentActiveTaskIds: Reducer<GlobalState>;
    setNotifications: Reducer<GlobalState>;
  };
}
