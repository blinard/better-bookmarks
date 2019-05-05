const requestBookmarksType = 'REQUEST_BOOKMARKS';
const receiveBookmarksType = 'RECEIVE_BOOKMARKS';
const initialState = {
    bookmarks: null,
    isLoadingBookmarks: false
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
            bookmarks: action.bookmarks 
        };
    }

    return state;
};