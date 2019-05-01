import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Bookmarks';
import Bookmarks from './Bookmarks';
import Login from './Login';

class Home extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
            <h1>Hello, world!</h1>
            <Login auth={this.props.auth} />
            <Bookmarks auth={this.props.auth} />
          </div>
        );
    }
}

export default connect(
    state => state,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Home);
