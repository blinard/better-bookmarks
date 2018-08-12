import { injectable, inject } from "inversify";
import "reflect-metadata";
import { BusinessTypes } from "./businessTypes";
import { IBookmarkRepository } from "../bb.dataaccess";
import { DataAccessTypes } from "../bb.dataaccess";
 import { IBookmark } from "../bb.models";

export interface IBookmarkManager {
    saveBookmark(bookmark: IBookmark): void
    getBookmark(key: string): Promise<IBookmark>
    getBookmarks(): Promise<IBookmark[]>
    deleteBookmark(bkmark: IBookmark): Promise<boolean>
}

@injectable()
export class BookmarkManager implements IBookmarkManager {
    constructor(
        @inject(DataAccessTypes.IBookmarkRepository) private _bookmarkRepository: IBookmarkRepository) {
    }

    saveBookmark(bookmark: IBookmark): void {
        this._bookmarkRepository.create(bookmark);        
    }

    getBookmark(key: string): Promise<IBookmark> {
        return this._bookmarkRepository.getByKey(key);
    }

    getBookmarks(): Promise<IBookmark[]> {
        return this._bookmarkRepository.getAll();
    }

    deleteBookmark(bkmark: IBookmark): Promise<boolean> {
        return this._bookmarkRepository.delete(bkmark);
    }
}