import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "../types";
import { IBookmarkRepository } from "bb.dataaccess";
import { Types as daTypes } from "bb.dataaccess";
import { Bookmark } from "bb.models";

export interface IBookmarkManager {
    saveBookmark(bookmark: Bookmark): void
    getBookmark(key: string): Promise<Bookmark>
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
}