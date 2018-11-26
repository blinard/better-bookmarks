import {BrowserFacade} from './browserFacades/chromeBrowser';

export class BookmarkManager {
    constructor() {
        this.browserFacade = new BrowserFacade();
    }

    //returns promise of bookmarksArray
    getBookmarks() {
        return this.browserFacade.getLocalStorageData();
    }

    //return promise of bookmark with key === bookmarkKey
    getBookmark(bookmarkKey) {
        return this.getBookmarks()
            .then((bookmarksArray) => {
                return BookmarkManager.getBookmarkFromList(bookmarkKey, bookmarksArray);
            });
    }

    static getBookmarkFromList(bookmarkKey, bookmarksArray) {
        var normalizedKey = bookmarkKey.toLowerCase().trim();
        return bookmarksArray.find((bkmk) => bkmk.key.toLowerCase().trim() === normalizedKey);
    }

    saveBookmark(bookmark) {
        this.getBookmarks()
            .then((bookmarksArray) => {
                var existingBookmark = BookmarkManager.getBookmarkFromList(bookmark.key, bookmarksArray);
                if (!existingBookmark) {
                    bookmark.key = bookmark.key.toLowerCase().trim();
                    bookmarksArray.push(bookmark);
                    this.browserFacade.setLocalStorageData(bookmarksArray);
                }
            });
    }
}