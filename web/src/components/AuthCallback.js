import React, { Component } from 'react';
import loading from '../logo.svg';

class AuthCallback extends Component {

  render() {
      return (
          <div>
              <img src={loading} alt="loading" />
          </div>
      );
  }    
}

export default AuthCallback;