import React from 'react';
import dva from 'dva';
import App from './App';
import './index.less';

import GlobalModel from './models/global';

const app = dva();

app.router(() => <App />);

app.model(GlobalModel);

app.start('#root');
