import {
  Dispatch as ReduxDispatch,
  AnyAction,
} from 'redux';
import { GlobalState } from '../../../../interfaces/models/global';

export interface ListPageProps extends GlobalState {
  dispatch: ReduxDispatch<AnyAction>;
  className?: string;
}
