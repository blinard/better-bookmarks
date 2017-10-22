import { BookmarkMap } from "../../node_modules/bb.models/dist/bb.models";

export interface IBookmarkDataAccess {
    getData(): Promise<BookmarkMap>
    setData(bookmarkMap: BookmarkMap): Promise<boolean>
}