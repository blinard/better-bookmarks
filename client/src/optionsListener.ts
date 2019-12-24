import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { IBookmarkManager } from './bookmarkManager';
import { ISyncService } from './syncService';
import { BrowserFacade } from './browserFacades/browserFacade';

export interface IOptionsListener {
    addOptionsListener(): void
}

@injectable()
export class OptionsListener implements IOptionsListener {
    constructor(
        @inject(TYPES.BrowserFacade) private _browser: BrowserFacade, 
        @inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager, 
        @inject(TYPES.ISyncService) private _syncService: ISyncService) { }

    addOptionsListener(): void {
        this._browser.addOnMessageListener(this.onMessageHandler.bind(this));
    }

    // TODO: Consolidate type keys so that they're referenced from a common object
    private onMessageHandler(event: any, sender: chrome.runtime.MessageSender, sendResponseCallback: (response: any) => void) {
        if (!sendResponseCallback) return;
        if (!event || !event.type) {
            return;
        }

        if (event.type === 'bb-getauth') {
            var authResult = JSON.parse(localStorage.authResult);
            sendResponseCallback(authResult);
            return true;
        }

        if (event.type === 'bb-getbookmarks') {
            this._bookmarkManager.getBookmarks()
                .then((bookmarksArray) => {
                    console.log(bookmarksArray);
                    sendResponseCallback(bookmarksArray);
                });
            return true;
        }

        if (event.type === 'bb-deletebookmark') {
            console.log(`retrieving bookmark for deletion - ${event.bookmark.key}`);
            this._bookmarkManager.getBookmark(event.bookmark.key)
                .then((bookmark) => {
                    console.log(`bookmark found - ${bookmark}`);
                    if (!bookmark) { 
                        sendResponseCallback(false);
                        return;
                    }

                    bookmark.isDeleted = true;
                    this._bookmarkManager.saveBookmark(bookmark)
                        .then(() => {
                            console.log(`bookmark saved locally - initating sync`);
                            //chrome.runtime.sendMessage({ type: 'bb-syncbookmarks' });
                            this._bookmarkManager.getBookmarks()
                                .then((bookmarksArray) => {
                                    console.log(`initiating sync - ${bookmarksArray}`);
                                    this._syncService.synchronizeWithService(bookmarksArray);
                                });
                            sendResponseCallback(true);
                        })
                        .catch((err) => {
                            sendResponseCallback(false);
                        });
                })
                .catch((err) => {
                    sendResponseCallback(false);
                });
            return true;
        }

        return false;
    }
}
