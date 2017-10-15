import { BookmarkMap } from "../models/bookmarkMap";

export interface IBookmarkDataAccess {
    getData(): Promise<BookmarkMap>
    setData(bookmarkMap: BookmarkMap): Promise<boolean>
}