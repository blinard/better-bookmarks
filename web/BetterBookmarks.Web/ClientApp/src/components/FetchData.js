import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { actionCreators } from '../store/WeatherForecasts';
import Bookmarks from '../services/Bookmarks';

class FetchData extends Component {
    bookmarkService;
    bookmarks;

  constructor(props) {
    super(props);
    this.state = {
        bookmarks: []
    };
  }

  componentDidMount() {
    // This method is called when the component is first added to the document
    this.ensureDataFetched();
  }

  ensureDataFetched() {
    const startDateIndex = parseInt(this.props.match.params.startDateIndex, 10) || 0;
    this.props.requestWeatherForecasts(startDateIndex);
    this.bookmarkService = new Bookmarks(this.props.auth);
    this.bookmarkService.getAll()
        .then(bkmrks => {
            this.setState({
                bookmarks: bkmrks
            });
        });
  }

  render() {
    return (
      <div>
        <h1>Bookmarks</h1>
        <p>This component demonstrates fetching data from the server and working with URL parameters.</p>
        {renderBookmarksTable(this.state.bookmarks)}
      </div>
    );
  }
}

function renderBookmarksTable(bookmarks) {
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

export default connect(
  state => state,
  dispatch => bindActionCreators(actionCreators, dispatch)
)(FetchData);
