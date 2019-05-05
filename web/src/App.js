import './App.css';

import React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import AuthCallback from './components/AuthCallback';
import About from './components/About';
import Auth from './services/Auth';

const auth = new Auth();
const handleAuthentication = (nextState, replace) => {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
        auth.handleAuthentication();
    }
}

export default () => (
    <Layout>
      <Route exact path='/' render={(props) => <Home {...props} />} />
      <Route path='/about' component={About} />
      <Route path='/auth' render={(props) => {
          handleAuthentication(props);
          return <AuthCallback {...props} />
      }}/>
    </Layout>
);
  