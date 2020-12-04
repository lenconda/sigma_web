import { GlobalState } from './global';

export interface LoadingModelType {
  global: boolean;
  effects: { [key: string]: boolean | undefined };
  models: {
    global?: boolean;
  };
}

export interface ConnectState {
  global: GlobalState;
  loading: LoadingModelType;
}
