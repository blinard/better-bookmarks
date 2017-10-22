import { injectable, inject } from "../../node_modules/inversify/dts/inversify";
import "reflect-metadata";
import TYPES from "../types";
import { IBookmarkRepository } from "../dataAccess/bookmarkRepository";
import { Bookmark } from "../../node_modules/bb.models/dist/bb.models";

export interface IBookmarkManager {
    saveBookmark(bookmark: Bookmark): void
    getBookmark(key: string): Promise<Bookmark>
}

@injectable()
export class BookmarkManager implements IBookmarkManager {
    constructor(
        @inject(TYPES.IBookmarkRepository) private _bookmarkRepository: IBookmarkRepository) {
    }

    saveBookmark(bookmark: Bookmark): void {
        this._bookmarkRepository.create(bookmark);        
    }

    getBookmark(key: string): Promise<Bookmark> {
        return this._bookmarkRepository.getByKey(key);
    }
}