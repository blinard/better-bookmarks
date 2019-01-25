import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { BookmarkManager } from './bookmarkManager';

export function addOptionsListeners() {
    var browserFacade = new ChromeBrowser();
    browserFacade.addOnMessageListener(onMessageHandler);
}

// TODO: Consolidate type keys so that they're referenced from a common object
function onMessageHandler(event: any, sender: chrome.runtime.MessageSender, sendResponseCallback: (response: any) => void) {
    if (!event || !event.type || event.type !== 'bb-getbookmarks' || !sendResponseCallback) {
        return;
    }

    var bookmarkManager = new BookmarkManager();
    bookmarkManager.getBookmarks()
        .then((bookmarksArray) => {
            sendResponseCallback(bookmarksArray);
        });
    
    return true;
}
