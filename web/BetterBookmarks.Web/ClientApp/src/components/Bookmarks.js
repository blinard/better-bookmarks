import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/Bookmarks';

class Bookmarks extends Component {

  constructor(props) {
    super(props);

    this.renderBookmarksTable = this.renderBookmarksTable.bind(this);
  }

  componentDidMount() {
      if (this.props.auth.isAuthenticated()) {
        this.props.requestBookmarks();
      }
  }

  render() {
    if (!this.props.auth.isAuthenticated()) {
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
