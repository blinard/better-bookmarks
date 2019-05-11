import React, { Component } from 'react';
import loading from '../logo.svg';

class AuthCallback extends Component {

  constructor(props) {
    super(props);
  }
  
  render() {
      return (
          <div>
              <img src={loading} alt="loading" />
          </div>
      );
  }    
}

export default AuthCallback;