import { BookmarkMap } from "./bookmarkMap";
import { IBookmark } from "./bookmark";

export class ModelUtilities {
    public static BookmarkMapToArray(bookmarkMap: BookmarkMap): Array<IBookmark> {
        let result = new Array<IBookmark>();
        for(let bookmarkKey in bookmarkMap) {
            if (!bookmarkMap.hasOwnProperty(bookmarkKey)) {
                continue;
            }

            result.push(bookmarkMap[bookmarkKey]);
        }
        return result;
    }
}