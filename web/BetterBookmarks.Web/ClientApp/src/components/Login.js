import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/WeatherForecasts';

class Login extends Component {

  constructor(props) {
    super(props);

    this.triggerAuth = this.triggerAuth.bind(this);
  }

  render() {
    if (this.props.auth.isAuthenticated()) {
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
    this.props.auth.login();
  }
}

export default connect(
  state => state,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Login);
