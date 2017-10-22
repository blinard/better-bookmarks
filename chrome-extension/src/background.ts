import {ChromeFacade} from './business/chromeFacade';
import * as Rx from "../node_modules/rxjs/Rx";

import {BookmarkRepository} from "./dataAccess/bookmarkRepository";
import {IBookmarkManager} from "./business/bookmarkManager";
import container from "./inversify.config";
import "reflect-metadata";
import TYPES from "./types";
import { Bookmark } from "../node_modules/bb.models/dist/bb.models"

namespace Background {
    let chromeFacade = container.resolve(ChromeFacade); //new ChromeFacade();
    //let bookmarkRepository = new BookmarkRepository(chromeFacade);
    let bookmarkManager = container.get<IBookmarkManager>(TYPES.IBookmarkManager); //new BookmarkManager(bookmarkRepository);

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

    // omniboxObservables.inputChanged.subscribe(icData => {
    //     console.log("inputChanged: " + icData.text);
    //     icData.suggestFunc([
    //         {content: " one", description: "the first one"},
    //         {content: " number two", description: "the second entry"}
    //     ]);
    // });
}
