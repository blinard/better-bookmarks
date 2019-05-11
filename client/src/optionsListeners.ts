import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { BookmarkManager } from './bookmarkManager';
import { SyncService } from './syncService';

export function addOptionsListeners() {
    var browserFacade = new ChromeBrowser();
    browserFacade.addOnMessageListener(onMessageHandler);
}

// TODO: Consolidate type keys so that they're referenced from a common object
function onMessageHandler(event: any, sender: chrome.runtime.MessageSender, sendResponseCallback: (response: any) => void) {
    if (!sendResponseCallback) return;
    if (!event || !event.type) {
        return;
    }

    if (event.type === 'bb-getauth') {
        var authResult = JSON.parse(localStorage.authResult);
        sendResponseCallback(authResult);
        return true;
    }

    if (event.type === 'bb-getbookmarks') {
        var bookmarkManager = new BookmarkManager();
        bookmarkManager.getBookmarks()
            .then((bookmarksArray) => {
                console.log(bookmarksArray);
                sendResponseCallback(bookmarksArray);
            });
        return true;
    }

    if (event.type === 'bb-deletebookmark') {
        var bookmarkManager = new BookmarkManager();
        console.log(`retrieving bookmark for deletion - ${event.bookmark.key}`);
        bookmarkManager.getBookmark(event.bookmark.key)
            .then((bookmark) => {
                console.log(`bookmark found - ${bookmark}`);
                if (!bookmark) { 
                    sendResponseCallback(false);
                    return;
                }

                bookmark.isDeleted = true;
                bookmarkManager.saveBookmark(bookmark)
                    .then(() => {
                        console.log(`bookmark saved locally - initating sync`);
                        //chrome.runtime.sendMessage({ type: 'bb-syncbookmarks' });
                        bookmarkManager.getBookmarks()
                            .then((bookmarksArray) => {
                                console.log(`initiating sync - ${bookmarksArray}`);
                                var syncService = new SyncService();
                                syncService.synchronizeWithService(bookmarksArray);
                            });
                        sendResponseCallback(true);
                    })
                    .catch((err) => {
                        sendResponseCallback(false);
                    });
            })
            .catch((err) => {
                sendResponseCallback(false);
            });
        return true;
    }

    return false;
}
