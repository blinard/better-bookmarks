import BookmarkService from '../strategies/BookmarksService';
import BookmarkExtension from '../strategies/BookmarksExtension';
import Utils from '../services/Utils';

const requestBookmarksType = 'REQUEST_BOOKMARKS';
const receiveBookmarksType = 'RECEIVE_BOOKMARKS';

const deletedBookmarkType = 'DELETED_BOOKMARK';
const initialState = {
  bookmarks: [],
  isLoadingBookmarks: false,
  hasLoadedBookmarks: false
};

export const actionCreators = {
  requestBookmarks: () => async (dispatch, getState) => {
    if (!getState().user.accessToken) {
      // If we don't have an access token, we can't query for bookmarks.
      return;
    }

    dispatch({ type: requestBookmarksType });

    let bookmarks;
    if (Utils.isInChromeExtension()) {
      let bookmarksExtension = new BookmarkExtension();
      bookmarks = await bookmarksExtension.getBookmarks();
    } else {
      let bookmarkService = new BookmarkService();
      bookmarks = await bookmarkService.getBookmarks(getState().user.accessToken);
    }

    dispatch({ type: receiveBookmarksType, bookmarks: bookmarks });
  },
  deleteBookmark: (bookmark) => async (dispatch, getState) => {
    if (!getState().user.accessToken) {
      // If we don't have an access token, we can't hit the api.
      return;
    }

    if (Utils.isInChromeExtension()) {
      let bookmarksExtension = new BookmarkExtension();
      await bookmarksExtension.deleteBookmark(bookmark);
    } else {
      let bookmarkService = new BookmarkService();
      await bookmarkService.deleteBookmark(bookmark, getState().user.accessToken);
    }

    dispatch({ type: deletedBookmarkType, bookmark: bookmark });
  }
};

export const reducer = (state, action) => {
  state = state || initialState;

  if (action.type === requestBookmarksType) {
    return { ...state, isLoadingBookmarks: true };
  }

  if (action.type === receiveBookmarksType) {
    return {
      ...state,
      isLoadingBookmarks: false,
      hasLoadedBookmarks: true,
      bookmarks: action.bookmarks
    };
  }

  if (action.type === deletedBookmarkType) {
    let newState = { ...state };
    newState.bookmarks = state.bookmarks.filter(bkmrk => bkmrk.key !== action.bookmark.key).map(bkmrk => { return {...bkmrk}; });
    return newState;
  }

  return state;
};