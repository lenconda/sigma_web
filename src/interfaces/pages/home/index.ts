import { RouteComponentProps } from 'react-router';
import {
  Dispatch,
  AnyAction,
} from 'redux';
import { GlobalState } from '../../models/global';

export interface HomePageProps extends RouteComponentProps, GlobalState {
  dispatch: Dispatch<AnyAction>;
}
