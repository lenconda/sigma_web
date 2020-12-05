import {
  GlobalModelType,
} from '../interfaces/models/global';
import { ConnectState } from '../interfaces/models';
import moment from 'moment';
import Bus from '../core/bus';
import {
  Dispatch,
  PaginationConfig,
  NotificationInfo,
} from '../interfaces';
import { getNotifications } from '../services/notifications';

const today = moment().startOf('day').toDate();

const GlobalModel: GlobalModelType = {
  namespace: 'global',
  state: {
    profile: {
      name: 'lenconda',
      email: 'i@lenconda.top',
      avatar: '/assets/images/default_avatar.jpg',
      createdAt: new Date().toISOString(),
    },
    notifications: [],
    dateRange: [today, today],
    currentActiveTaskIds: [],
    bus: new Bus<Dispatch>(),
    smallWidth: false,
    hasMoreNotifications: false,
    notificationPagination: {
      current: 1,
      size: 10,
    },
    fetchNotificationsLoading: false,
  },
  effects: {
    * fetchNotifications({ payload }, { put, select }) {
      const {
        current: requestCurrent = 1,
        size: requestSize = 10,
      } = payload;
      yield put({
        type: 'setNotificationPagination',
        payload: {
          current: requestCurrent,
          size: requestSize,
        },
      });
      const pagination: PaginationConfig = yield select((state: ConnectState) => ({
        ...state.global.notificationPagination,
      }));
      yield put({
        type: 'setFetchNotificationsLoading',
        payload: true,
      });
      const {
        items = [],
        total = 0,
        size = 10,
        current = 1,
      } = yield getNotifications(pagination);
      yield put({
        type: 'setFetchNotificationsLoading',
        payload: false,
      });
      const currentNotifications: NotificationInfo[] = yield select((state: ConnectState) => {
        return state.global.notifications;
      });
      yield put({
        type: 'setNotifications',
        payload: current === 1 ? items : currentNotifications.concat(items),
      });
      yield put({
        type: 'setHasMoreNotifications',
        payload: total - (current * size) > 0,
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
    setSmallWidth(state, { payload }) {
      return {
        ...state,
        smallWidth: payload,
      };
    },
    setHasMoreNotifications(state, { payload }) {
      return {
        ...state,
        hasMoreNotifications: payload,
      };
    },
    setNotificationPagination(state, { payload }) {
      return {
        ...state,
        notificationPagination: payload,
      };
    },
    setFetchNotificationsLoading(state, { payload }) {
      return {
        ...state,
        fetchNotificationsLoading: payload,
      };
    },
  },
  subscriptions: {
    setup({ dispatch }) {
      const SMALL_WIDTH_THRESHOLD = 720;
      const setSmallWidth = (size: number, threshold: number) => {
        dispatch({
          type: 'setSmallWidth',
          payload: size < threshold,
        });
      };
      setSmallWidth(window.innerWidth, SMALL_WIDTH_THRESHOLD);
      window.addEventListener('resize', () => {
        setSmallWidth(window.innerWidth, SMALL_WIDTH_THRESHOLD);
      });
      dispatch({
        type: 'fetchNotifications',
        payload: {
          current: 2,
          size: 5,
        },
      });
    },
  },
};

export default GlobalModel;
