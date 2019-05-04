import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Auth from '../services/Auth';

class Login extends Component {
  auth = new Auth();

  constructor(props) {
    super(props);

    this.triggerAuth = this.triggerAuth.bind(this);
  }

  render() {
    if (new Date().getTime() < this.props.user.expiresAt) {
        return (<div></div>);
    }

    return (
      <div>
        <p>Looks like you aren't logged in. Please login now.</p>
        <div>
            <button className="btn btn-primary" onClick={this.triggerAuth}>Login</button>
        </div>
      </div>
    );
  }

  triggerAuth() {
    let auth = new Auth();
    auth.login();
  }
}

export default connect(
  state => state,
)(Login);
//   dispatch => bindActionCreators(actionCreators, dispatch)
