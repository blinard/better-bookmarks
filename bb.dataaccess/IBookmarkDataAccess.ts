import { BookmarkMap } from "../bb.models";

export interface IBookmarkDataAccess {
    getData(): Promise<BookmarkMap>
    setData(bookmarkMap: BookmarkMap): Promise<boolean>
}