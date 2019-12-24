import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { IBookmarkManager } from './bookmarkManager';
import { ISyncService } from './syncService';
import { BrowserFacade } from "./browserFacades/browserFacade";

export interface ISyncListener {
    addSyncListener(): void;
}

@injectable()
export class SyncListener implements ISyncListener {
    constructor(
        @inject(TYPES.BrowserFacade) private _browser: BrowserFacade,
        @inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager, 
        @inject(TYPES.ISyncService) private _syncService: ISyncService) { }

    addSyncListener(): void {
        this._browser.addOnMessageListener(this.onMessageHandler.bind(this));
    }
    
    // TODO: Consolidate type keys so that they're referenced from a common object
    private onMessageHandler(event: any, sender: chrome.runtime.MessageSender, sendResponseCallback: (response: any) => void) {
        if (!event || !event.type || event.type !== 'bb-syncbookmarks') {
            return;
        }

        console.log(`beginning bookmark sync`);
        this._bookmarkManager.getBookmarks()
            .then((bookmarksArray) => {
                console.log(`initiating sync - ${bookmarksArray}`);
                this._syncService.synchronizeWithService(bookmarksArray);
            });
        
        return true;
    }
}
