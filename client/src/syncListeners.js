import {BrowserFacade} from './browserFacades/chromeBrowser';
import {BookmarkManager} from './bookmarkManager';
import {Bookmark} from './models/bookmark';
import {SyncService} from './syncService';

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
            var syncService = new SyncService();
            syncService.synchronizeWithService(bookmarksArray);
        });
    
    return true;
}