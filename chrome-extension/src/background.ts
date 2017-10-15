import {ChromeFacade} from './business/chromeFacade';
import * as Rx from "../node_modules/rxjs/Rx";

import {BookmarkRepository} from "./dataAccess/bookmarkRepository";
import {BookmarkManager} from "./business/bookmarkManager";
import { Bookmark } from './models/bookmark';

namespace Background {
    let chromeFacade = new ChromeFacade();
    let bookmarkRepository = new BookmarkRepository(chromeFacade);
    let bookmarkManager = new BookmarkManager(bookmarkRepository);

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
