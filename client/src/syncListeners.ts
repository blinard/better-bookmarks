import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { BookmarkManager } from './bookmarkManager';
import { SyncService } from './syncService';

export function addSyncListeners() {
    var browserFacade = new ChromeBrowser();
    browserFacade.addOnMessageListener(onMessageHandler);
}

// TODO: Consolidate type keys so that they're referenced from a common object
function onMessageHandler(event: any, sender: chrome.runtime.MessageSender, sendResponseCallback: (response: any) => void) {
    if (!event || !event.type || event.type !== 'bb-syncbookmarks') {
        return;
    }

    console.log(`beginning bookmark sync`);
    var bookmarkManager = new BookmarkManager();
    bookmarkManager.getBookmarks()
        .then((bookmarksArray) => {
            console.log(`initiating sync - ${bookmarksArray}`);
            var syncService = new SyncService();
            syncService.synchronizeWithService(bookmarksArray);
        });
    
    return true;
}