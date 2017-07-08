import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import Info from './Info';
import { HashRouter, Route, Switch } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path='/info' component={Info} />
      <Route path='/' component={App} />
    </Switch>
  </HashRouter>,
  document.getElementById('root'));
// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
