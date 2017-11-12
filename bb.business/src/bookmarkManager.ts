import { injectable, inject } from "inversify";
import "reflect-metadata";
import { Types } from "./types";
import { IBookmarkRepository } from "bb.dataaccess";
import { Types as daTypes } from "bb.dataaccess";
import { Bookmark } from "bb.models";

export interface IBookmarkManager {
    saveBookmark(bookmark: Bookmark): void
    getBookmark(key: string): Promise<Bookmark>
    getBookmarks(): Promise<Bookmark[]>
    deleteBookmark(bkmark: Bookmark): Promise<boolean>
}

@injectable()
export class BookmarkManager implements IBookmarkManager {
    constructor(
        @inject(daTypes.IBookmarkRepository) private _bookmarkRepository: IBookmarkRepository) {
    }

    saveBookmark(bookmark: Bookmark): void {
        this._bookmarkRepository.create(bookmark);        
    }

    getBookmark(key: string): Promise<Bookmark> {
        return this._bookmarkRepository.getByKey(key);
    }

    getBookmarks(): Promise<Bookmark[]> {
        return this._bookmarkRepository.getAll();
    }

    deleteBookmark(bkmark: Bookmark): Promise<boolean> {
        return this._bookmarkRepository.delete(bkmark);
    }
}