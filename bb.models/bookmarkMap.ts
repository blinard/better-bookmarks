import { IBookmark } from "./bookmark";
import { Dictionary } from "./dictionary";

export class BookmarkMap implements Dictionary<IBookmark> {
    [k: string]: IBookmark;
}