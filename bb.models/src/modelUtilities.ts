import { BookmarkMap } from "./bookmarkMap";
import { Bookmark } from "./bookmark";

export class ModelUtilities {
    public static BookmarkMapToArray(bookmarkMap: BookmarkMap): Array<Bookmark> {
        let result = new Array<Bookmark>();
        for(let bookmarkKey in bookmarkMap) {
            if (!bookmarkMap.hasOwnProperty(bookmarkKey)) {
                continue;
            }

            result.push(bookmarkMap[bookmarkKey]);
        }
        return result;
    }
}