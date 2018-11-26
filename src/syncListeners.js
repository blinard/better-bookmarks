import {BrowserFacade} from './browserFacades/chromeBrowser';
import {BookmarkManager} from './bookmarkManager';
import {Bookmark} from './models/bookmark';

export function addSyncListeners() {
    var browserFacade = new BrowserFacade();
    browserFacade.addOnMessageListener(onMessageHandler);
}

// TODO: Consolidate type keys so that they're referenced from a common object
function onMessageHandler(event) {
    if (!event || !event.type || event.type !== 'bb-syncbookmarks') {
        return;
    }

    var bookmarkManager = new BookmarkManager();
    bookmarkManager.getBookmarks()
        .then((bookmarksArray) => {
            sendSyncRequest(bookmarksArray);
        });
    
    return true;
}

function sendSyncRequest(bookmarksArray) {
    const accessToken = getCachedAccessToken();
    if (!accessToken) {
        return;
    }

    // TODO: Swap in Url from Config.
    var req = new Request(
        "https://blah.blah.com/api/bookmarks/sync",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(bookmarksArray),
            mode: "cors",
            cache: "no-store"
        }
    );

    fetch(req)
        .then(resp => {
            // TODO: Check response, pop message?
            //resp.json()?
        });
}

function isLoggedIn(token) {
    // The user is logged in if their token isn't expired
    return jwt_decode(token).exp > Date.now() / 1000;
}
  
function getCachedAccessToken() {
    const authResult = JSON.parse(localStorage.authResult || '{}');
    const token = authResult.id_token;
    // TODO: Add refresh token logic
    if (token && isLoggedIn(token)) {
        renderProfileView(authResult);
        return authResult.access_token;
    }

    return undefined;
}