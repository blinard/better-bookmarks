import * as Rx from "rxjs/Rx";
import {BookmarkRepository} from "bb.dataaccess";
import {IBookmarkManager} from "bb.business";
import container from "./inversify.config";
import "reflect-metadata";
import { Bookmark } from "bb.models"
import { Types as busTypes, IBrowserFacade } from "bb.business";

namespace Background {
    //let chromeFacade = container.resolve(ChromeFacade);
    let chromeFacade = container.get<IBrowserFacade>(busTypes.IBrowserFacade);
    let bookmarkManager = container.get<IBookmarkManager>(busTypes.IBookmarkManager); //new BookmarkManager(bookmarkRepository);

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
