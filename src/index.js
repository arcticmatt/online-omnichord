import React from 'react';
import ReactDOM from 'react-dom';
import './css/index.css';
import App from './App';
import Info from './Info';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
  <BrowserRouter>
    <Switch>
        <Route path='/info' component={Info} />
        <Route path='/' component={App} />
      </Switch>
    </BrowserRouter>,
  document.getElementById('root'));
// ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
