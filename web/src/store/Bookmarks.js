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

    const req = new Request(
      "https://api.better-bookmarks.com/bookmarks",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${getState().user.accessToken}`
        },
        mode: "cors",
        cache: "no-store"
      }
    );

    const resp = await fetch(req);
    if (resp.status < 200 || resp.status >= 300) {
      let messageString = `Error getting bookmarks. Status: ${resp.status}`;
      throw new Error(messageString);
    }

    const bookmarks = await resp.json();
    dispatch({ type: receiveBookmarksType, bookmarks });
  },
  deleteBookmark: (bookmark) => async (dispatch, getState) => {
    if (!getState().user.accessToken) {
      // If we don't have an access token, we can't hit the api.
      return;
    }

    const req = new Request(
      `https://api.better-bookmarks.com/bookmarks?bookmarkKey=${encodeURIComponent(bookmark.key)}`,
      {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${getState().user.accessToken}`
        },
        mode: "cors",
        cache: "no-store"
      }
    );

    const resp = await fetch(req);
    if (resp.status < 200 || resp.status >= 300) {
      let messageString = `Error deleting bookmark. Status: ${resp.status}`;
      throw new Error(messageString);
    }

    dispatch({ type: deletedBookmarkType, bookmark });
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