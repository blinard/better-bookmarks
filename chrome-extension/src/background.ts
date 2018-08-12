import * as Rx from "rxjs/Rx";
import {BookmarkRepository} from "@bit/blinard.better-bookmarks.bb.dataaccess";
import {IBookmarkManager} from "@bit/blinard.better-bookmarks.bb.business";
import container from "./inversify.config";
import "reflect-metadata";
import { Bookmark, ISuggestResult } from "@bit/blinard.better-bookmarks.bb.models";
// import { Bookmark, ISuggestResult } from "../../bb.models";
import { BusinessTypes, IBrowserFacade } from "@bit/blinard.better-bookmarks.bb.business";

namespace Background {
    //let chromeFacade = container.resolve(ChromeFacade);
    let chromeFacade = container.get<IBrowserFacade>(BusinessTypes.IBrowserFacade);
    let bookmarkManager = container.get<IBookmarkManager>(BusinessTypes.IBookmarkManager); //new BookmarkManager(bookmarkRepository);

    let omniboxObservables = chromeFacade.addOmniboxListeners();
    
    omniboxObservables.inputEntered.subscribe((txt: string) => {
        let entry = txt.trim();
        if (entry.startsWith("go ")) {
            let key = entry.replace("go ", "");
            bookmarkManager.getBookmark(key)
                .then((bookmark) => {
                    if (!bookmark) {
                        chromeFacade.postNotification("Bookmark not found", `No bookmark could be found for ${key}`);
                        return;
                    }
                    if (!bookmark.url) {
                        chromeFacade.postNotification("Invalid bookmark", `${key} is an invalid bookmark`);
                        return;
                    }

                    chromeFacade.navigateCurrentTab(bookmark.url);
                });
            return; //Handle go as a tab navigation in the future.
        }
        
        chromeFacade.getCurrentTabUrl()
            .then((url) => {
                bookmarkManager.saveBookmark(new Bookmark(entry, url));
                chromeFacade.postNotification("Bookmark Saved", `Current url saved as bookmark: ${entry}`, "bb-icon.png");
            });
    });

    omniboxObservables.inputChanged.subscribe(icData => {
        bookmarkManager.getBookmarks()
            .then((bookmarks) => {
                if (!icData.text.startsWith("go ") || icData.text.length < 4) {
                    return;
                }

                let inputText = icData.text.replace("go ", "");

                let suggestResults = bookmarks
                    .filter((bkmark) => {
                        return bkmark.key.includes(inputText) || bkmark.url.includes(inputText);
                    })
                    .map((bkmark) => {
                        return <ISuggestResult>{ content: 'go ' + bkmark.key, description: bkmark.key + ' - ' + bkmark.url }
                    });
                icData.suggestFunc(suggestResults);
            });
    });
}
