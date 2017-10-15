import {Bookmark} from "../models/bookmark";
import {IBookmarkRepository} from "../dataAccess/bookmarkRepository";

export interface IBookmarkManager {
    saveBookmark(bookmark: Bookmark): void
    getBookmark(key: string): Promise<Bookmark>
}

export class BookmarkManager implements IBookmarkManager {
    constructor(private _bookmarkRepository: IBookmarkRepository) {
    }

    saveBookmark(bookmark: Bookmark): void {
        this._bookmarkRepository.create(bookmark);        
    }

    getBookmark(key: string): Promise<Bookmark> {
        return this._bookmarkRepository.getByKey(key);
    }
}