import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Counter';
import Auth from '../services/Auth.js';

const Counter = props => (
  <div>
    <h1>Counter</h1>

    <p>This is a simple example of a React component.</p>

    <p>Current count: <strong>{props.count}</strong></p>

    <button className="btn btn-primary" onClick={props.increment}>Increment</button>

    <p>Here's the auth button.</p>
    {renderAuthButton()}
  </div>
);

function renderAuthButton() {
    return <button className="btn btn-primary" onClick={triggerAuth}>Auth</button>
}

function triggerAuth() {
    const auth = new Auth();
    auth.login();
}

export default connect(
  state => state.counter,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Counter);
