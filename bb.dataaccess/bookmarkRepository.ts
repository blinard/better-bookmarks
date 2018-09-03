import { injectable, inject } from "inversify";
import "reflect-metadata";
import { DataAccessTypes } from "./dataAccessTypes"
import { IBookmark, Bookmark, BookmarkMap } from "../bb.models";
import { IBookmarkDataAccess } from "./IBookmarkDataAccess";

export interface IBookmarkRepository {
    getByKey(key: string): Promise<IBookmark | null>
    getAll(): Promise<IBookmark[]>
    create(bookmark: IBookmark): void
    update(bookmark: IBookmark): void
    delete(bookmark: IBookmark): Promise<boolean>
}

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
    private _bookmarkMap: Promise<BookmarkMap> | null;
    
    constructor(
        @inject(DataAccessTypes.IBookmarkDataAccess) private _dataAccess: IBookmarkDataAccess) {
    }

    getByKey(key: string): Promise<IBookmark | null> {
        if (!this._bookmarkMap) {
            this._bookmarkMap = this._dataAccess.getData();
        }

        return this._bookmarkMap
            .then((bookmarkMap: BookmarkMap) => {
                if (!bookmarkMap[key])
                    return null;
                    
                return Bookmark.hydrateNewBookmark(bookmarkMap[key]);
            });
    }

    getAll(): Promise<IBookmark[]> {
        if (!this._bookmarkMap) {
            this._bookmarkMap = this._dataAccess.getData();
        }

        return this._bookmarkMap
            .then((bookmarkMap: BookmarkMap) => {
                let bookmarks = new Array<IBookmark>();
                for (var key in bookmarkMap) {
                    if (!bookmarkMap.hasOwnProperty(key)) {
                        continue;
                    }

                    bookmarks.push(Bookmark.hydrateNewBookmark(bookmarkMap[key]));
                }

                return bookmarks;
            });
    }

    create(bookmark: IBookmark): void {
        this._bookmarkMap = this._dataAccess.getData();
        this._bookmarkMap
            .then((bookmarkMap: BookmarkMap) => {
                if (!bookmarkMap)
                    bookmarkMap = new BookmarkMap();
                    
                if (bookmarkMap[bookmark.key])
                    return;
                bookmarkMap[bookmark.key] = bookmark;
                this._dataAccess.setData(bookmarkMap);
            });
    }
    update(bookmark: Bookmark): void {
        throw new Error("Method not implemented.");
    }
    delete(bookmark: Bookmark): Promise<boolean> {
        this._bookmarkMap = this._dataAccess.getData();
        return this._bookmarkMap
            .then((bookmarkMap: BookmarkMap) => {
                if (!bookmarkMap)
                    bookmarkMap = new BookmarkMap();

                let newBookmarkMap = new BookmarkMap();
                for (var key in bookmarkMap) {
                    if (!bookmarkMap.hasOwnProperty(key) || key === bookmark.key) {
                        continue;
                    }

                    newBookmarkMap[key] = bookmarkMap[key];
                }
                
                this._bookmarkMap = null;
                return this._dataAccess.setData(newBookmarkMap);
            });
    }
}