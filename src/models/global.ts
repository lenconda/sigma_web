import {
  GlobalModelType,
} from '../interfaces/models/global';
import moment from 'moment';
import Bus from '../core/bus';
import { Dispatch } from '../interfaces';

const today = moment().startOf('day').toDate();

const GlobalModel: GlobalModelType = {
  namespace: 'global',
  state: {
    profile: {
      name: 'lenconda',
      email: 'i@lenconda.top',
      avatar: '/assets/default_avatar.jpg',
      createdAt: new Date().toISOString(),
    },
    notifications: [],
    dateRange: [today, today],
    currentActiveTaskIds: [],
    bus: new Bus<Dispatch>(),
  },
  effects: {
    * effectSetInitialActiveTaskId({ payload }, { put }) {
      yield put({
        type: 'setActiveTaskIds',
        payload: payload === '' ? [] : [payload],
      });
    },
  },
  reducers: {
    setProfile(state, { payload = undefined }) {
      return {
        ...state,
        profile: payload,
      };
    },
    setCurrentActiveTaskIds(state, { payload = [] }) {
      return {
        ...state,
        currentActiveTaskIds: payload,
      };
    },
    setDateRange(state, { payload = [] }) {
      return {
        ...state,
        dateRange: payload,
      };
    },
    setNotifications(state, { payload = [] }) {
      return {
        ...state,
        notifications: payload,
      };
    },
  },
};

export default GlobalModel;
