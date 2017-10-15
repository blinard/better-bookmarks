import { Bookmark } from "./bookmark";
import { Dictionary } from "./dictionary";

export class BookmarkMap implements Dictionary<Bookmark> {
    [k: string]: Bookmark;
}