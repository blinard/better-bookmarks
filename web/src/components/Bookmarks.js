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
    this.deleteBookmark = this.removeBookmark.bind(this);
  }

  componentDidMount() {
    if (this.auth.isAuthenticated()) {
      this.props.requestBookmarks();
    }
  }

  render() {
    if (!this.auth.isAuthenticated(this.props.user)) {
      return (<div></div>);
    }
    if (!this.props.bookmarks.hasLoadedBookmarks && !this.props.bookmarks.isLoadingBookmarks) {
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {bookmarks.map(bookmark =>
              <tr key={bookmark.key}>
                <td><a href={bookmark.url} target="_blank" rel="noopener noreferrer">{bookmark.key}</a></td>
                <td>{bookmark.url}</td>
                <td>{bookmark.tags}</td>
                <td>{bookmark.lastModified}</td>
                <td><button className="btn" onClick={() => {this.removeBookmark(bookmark)}}>Delete</button></td>
              </tr>
            )}
          </tbody>
        </table>
    );
  }

  removeBookmark(bookmark) {
    this.props.deleteBookmark(bookmark);
  }
}

export default connect(
  state => state,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(Bookmarks);
