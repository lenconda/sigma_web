import React from 'react';
import dva from 'dva';
import { createBrowserHistory } from 'history';
import App from './App';
import 'antd/dist/antd.css';
import './index.less';

import GlobalModel from './models/global';

const history = createBrowserHistory();

const app = dva({ history });
app.router(() => <App />);
app.model(GlobalModel);
app.start('#root');
