import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Bookmarks';
import Bookmarks from './Bookmarks';
import Login from './Login';

class Home extends Component {

  render() {
    return (
      <div>
        <Login />
        <Bookmarks />
      </div>
    );
  }
}

export default connect(
    state => state,
    dispatch => bindActionCreators(actionCreators, dispatch)
)(Home);
