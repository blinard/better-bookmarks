import React from 'react';
import { Route } from 'react-router';
import Layout from './components/Layout';
import Home from './components/Home';
import Counter from './components/Counter';
import FetchData from './components/FetchData';
import AuthCallback from './components/AuthCallback';
import Auth from './services/Auth';

const auth = new Auth();
const handleAuthentication = (nextState, replace) => {
    if (/access_token|id_token|error/.test(nextState.location.hash)) {
        auth.handleAuthentication();
    }
}

export default () => (
  <Layout auth={auth}>
    <Route exact path='/' render={(props) => <Home auth={auth} {...props} />} />
    <Route path='/counter' component={Counter} />
    <Route path='/fetch-data/:startDateIndex?' render={(props) => <FetchData auth={auth} {...props} />} />
    <Route path='/auth' render={(props) => {
        handleAuthentication(props);
        return <AuthCallback {...props} />
    }}/>
  </Layout>
);
