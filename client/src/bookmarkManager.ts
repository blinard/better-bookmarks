import { BrowserFacade } from './browserFacades/browserFacade';
import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { Bookmark } from './models/bookmark';

export class BookmarkManager {
    browserFacade: BrowserFacade;
    constructor() {
        // TODO: Inject as BrowserFacade - define ChromeBrowser in Ioc container?
        this.browserFacade = new ChromeBrowser();
    }

    getBookmarks() {
        return this.browserFacade.getLocalBookmarksData();
    }

    getBookmark(bookmarkKey: string) {
        return this.getBookmarks()
            .then((bookmarksArray) => {
                return BookmarkManager.getBookmarkFromList(bookmarkKey, bookmarksArray);
            });
    }

    static getBookmarkFromList(bookmarkKey: string, bookmarksArray: Array<Bookmark>) {
        var normalizedKey = bookmarkKey.toLowerCase().trim();
        return bookmarksArray.find((bkmk) => bkmk.key.toLowerCase().trim() === normalizedKey);
    }

    saveBookmark(bookmark: Bookmark) {
        console.log(`saving bookmark - ${bookmark}`);
        return this.getBookmarks()
            .then((bookmarksArray) => {
                var existingBookmark = BookmarkManager.getBookmarkFromList(bookmark.key, bookmarksArray);
                if (existingBookmark) {
                    existingBookmark.url = bookmark.url;
                    existingBookmark.tags = bookmark.tags;
                    existingBookmark.isDeleted = bookmark.isDeleted;
                    existingBookmark.lastModified = (new Date()).toJSON();
                    this.browserFacade.setLocalBookmarksData(bookmarksArray);
                    return;
                }

                bookmark.key = bookmark.key.toLowerCase().trim();
                bookmark.lastModified = (new Date()).toJSON();
                bookmarksArray.push(bookmark);
                this.browserFacade.setLocalBookmarksData(bookmarksArray);
            });
    }

    saveBookmarks(bookmarksArray: Array<Bookmark>) {
        this.browserFacade.setLocalBookmarksData(bookmarksArray);
    }
}