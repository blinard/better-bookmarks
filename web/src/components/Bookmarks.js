import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Bookmarks';
import Auth from '../services/Auth';

class Bookmarks extends Component {
  auth = new Auth();
  
  constructor(props) {
    super(props);

    this.renderBookmarksTable = this.renderBookmarksTable.bind(this);
  }

  render() {
    if (!this.auth.isAuthenticated(this.props.user)) {
      return (<div></div>);
    }
    if (!this.props.bookmarks.bookmarks) {
      this.props.requestBookmarks();
      return (<div></div>);
    }

    return (
      <div>
        {this.renderBookmarksTable(this.props.bookmarks.bookmarks)}
      </div>
    );
  }

  renderBookmarksTable(bookmarks) {
    return (
        <table className='table table-striped'>
          <thead>
            <tr>
              <th>Key</th>
              <th>Url</th>
              <th>Tags</th>
              <th>LastModified</th>
            </tr>
          </thead>
          <tbody>
            {bookmarks.map(bookmark =>
              <tr key={bookmark.key}>
                <td>{bookmark.key}</td>
                <td>{bookmark.url}</td>
                <td>{bookmark.tags}</td>
                <td>{bookmark.lastModified}</td>
              </tr>
            )}
          </tbody>
        </table>
    );
  }
}

export default connect(
  state => state,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Bookmarks);
