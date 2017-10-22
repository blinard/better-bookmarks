import { injectable, inject } from "../../node_modules/inversify/dts/inversify";
import "reflect-metadata";
import TYPES from "../types";
import { Bookmark, BookmarkMap, Dictionary } from "../../node_modules/bb.models/dist/bb.models";
import { IBookmarkDataAccess } from "./IBookmarkDataAccess";

export interface IBookmarkRepository {
    getByKey(key: string): Promise<Bookmark>
    create(bookmark: Bookmark): void
    update(bookmark: Bookmark): void
    delete(bookmark: Bookmark): void
}

@injectable()
export class BookmarkRepository implements IBookmarkRepository {
    private _bookmarkMap: Promise<BookmarkMap>;
    
    constructor(
        @inject(TYPES.IBookmarkDataAccess) private _dataAccess: IBookmarkDataAccess) {
    }

    getByKey(key: string): Promise<Bookmark> {
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

    create(bookmark: Bookmark): void {
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
    delete(bookmark: Bookmark): void {
        throw new Error("Method not implemented.");
    }
}