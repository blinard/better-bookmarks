import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { BrowserFacade } from './browserFacades/browserFacade';
import { Bookmark } from './models/bookmark';

export interface IBookmarkManager {
    getBookmarks(): Promise<Bookmark[]>
    getBookmark(bookmarkKey: string): Promise<Bookmark | undefined>
    saveBookmark(bookmark: Bookmark): Promise<void>
    saveBookmarks(bookmarksArray: Bookmark[]): void
}

@injectable()
export class BookmarkManager implements IBookmarkManager {

    constructor(@inject(TYPES.BrowserFacade) private _browser: BrowserFacade) { }

    getBookmarks() {
        return this._browser.getLocalBookmarksData();
    }

    getBookmark(bookmarkKey: string) {
        return this.getBookmarks()
            .then((bookmarksArray) => {
                return BookmarkManager.getBookmarkFromList(bookmarkKey, bookmarksArray);
            });
    }

    // TODO: Move this into it's own helper class.
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
                    this._browser.setLocalBookmarksData(bookmarksArray);
                    return;
                }

                bookmark.key = bookmark.key.toLowerCase().trim();
                bookmark.lastModified = (new Date()).toJSON();
                bookmarksArray.push(bookmark);
                this._browser.setLocalBookmarksData(bookmarksArray);
            });
    }

    saveBookmarks(bookmarksArray: Array<Bookmark>) {
        this._browser.setLocalBookmarksData(bookmarksArray);
    }
}