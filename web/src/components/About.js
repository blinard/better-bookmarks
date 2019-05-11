import React, { Component } from 'react';
import { connect } from 'react-redux';

class About extends Component {

  constructor(props) {
    super(props);
  }
  
  render() {
    return (
      <div>
        Oops...nothing to see here.
      </div>
    );
  }
}

export default connect(
  state => state
)(About);