import {ChromeFacade} from './business/chromeFacade';
import * as Rx from "../node_modules/rxjs/Rx";

import {BookmarkRepository} from "./dataAccess/bookmarkRepository";
import {IBookmarkManager} from "./business/bookmarkManager";
import container from "./inversify.config";
import "reflect-metadata";
import TYPES from "./types";
import { Bookmark } from './models/bookmark';

namespace Background {
    let chromeFacade = container.resolve(ChromeFacade); //new ChromeFacade();
    //let bookmarkRepository = new BookmarkRepository(chromeFacade);
    let bookmarkManager = container.get<IBookmarkManager>(TYPES.IBookmarkManager); //new BookmarkManager(bookmarkRepository);

    let omniboxObservables = chromeFacade.addOmniboxListeners();
    
    omniboxObservables.inputEntered.subscribe(txt => {
        let entry = txt.trim();
        if (entry.startsWith("go ")) {
            let key = entry.replace("go ", "");
            bookmarkManager.getBookmark(key)
                .then((bookmark) => {
                    if (!bookmark || !bookmark.url) 
                        return;
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
