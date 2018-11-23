import {BookmarkRepository} from "@bit/blinard.better-bookmarks.bb.dataaccess";
import {IBookmarkManager} from "@bit/blinard.better-bookmarks.bb.business";
import container from "../inversify.config";
import "reflect-metadata";
import { Bookmark, ISuggestResult } from "@bit/blinard.better-bookmarks.bb.models";
import { BusinessTypes, IBrowserFacade } from "@bit/blinard.better-bookmarks.bb.business";

let bookmarksDiv = document.getElementById("bookmarks");
let bookmarkManager = container.get<IBookmarkManager>(BusinessTypes.IBookmarkManager);
bookmarkManager.getBookmarks()
    .then((bkmrks) => {
        bookmarksDiv.innerText = JSON.stringify(bkmrks);
    })
    .catch((err) => {
        console.log(err);
    });