import React, { Component } from 'react';
import loading from '../images/loading.svg';

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