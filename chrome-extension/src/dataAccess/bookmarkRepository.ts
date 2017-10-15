import { Bookmark } from "../models/bookmark";
import { IBookmarkDataAccess } from "./IBookmarkDataAccess";
import { BookmarkMap } from "../models/bookmarkMap";
import { Dictionary } from "../models/dictionary";

export interface IBookmarkRepository {
    getByKey(key: string): Promise<Bookmark>
    create(bookmark: Bookmark): void
    update(bookmark: Bookmark): void
    delete(bookmark: Bookmark): void
}

export class BookmarkRepository implements IBookmarkRepository {
    private _bookmarkMap: Promise<BookmarkMap>;
    
    constructor(private _dataAccess: IBookmarkDataAccess) {
    }

    getByKey(key: string): Promise<Bookmark> {
        if (!this._bookmarkMap) {
            this._bookmarkMap = this._dataAccess.getData();
        }

        return this._bookmarkMap
            .then((bookmarkMap: BookmarkMap) => {
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