import React from 'react';
import ReactDOM from 'react-dom';
import App from './containers/App';
import { Router } from 'react-router-dom';
import history from './components/history';


import './styles/styles.css';


ReactDOM.render(
    <Router history={history}>
        <App />
    </Router>,
    document.getElementById('root')
);
