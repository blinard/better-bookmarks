import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { IBookmarkManager } from './bookmarkManager';
import { Bookmark } from './models/bookmark';
import { ISyncService } from './syncService';
import { OmniboxProvideSuggestionsCallback, BrowserFacade } from './browserFacades/browserFacade';
import * as _ from 'lodash';

export interface IOmniboxListener {
    addOmniboxListeners();
}

@injectable()
export class OmniboxListener implements IOmniboxListener {

    constructor(
        @inject(TYPES.BrowserFacade) private _browser: BrowserFacade, 
        @inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager,
        @inject(TYPES.ISyncService) private _syncService: ISyncService) {}

    addOmniboxListeners() {
        this._browser.addOmniboxInputChangedListener(this.inputChangedHandler.bind(this));
        this._browser.addOmniboxInputEnteredListener(this.inputEnteredHandler.bind(this));
    }

    private inputEnteredHandler(text: string, disposition: chrome.omnibox.OnInputEnteredDisposition): void {    
        // inputEnteredDisposition could be used to control url navigation tab behavior (currentTab, newForegroundTab, etc)
        // See: https://developer.chrome.com/extensions/omnibox#type-OnInputEnteredDisposition
        let commandTokens = text.trim().split(" ");
        if (!commandTokens || commandTokens.length <= 0) {
            // Error - log error
            return;
        }

        // First command token should always be normalized
        commandTokens[0] = commandTokens[0].toLowerCase();

        if (commandTokens && commandTokens.length === 1 && commandTokens[0] === "refresh") {
            // Command: refresh
            this.syncBookmarks();
            this._browser.postNotification("Bookmarks Synced", `Your bookmarks have been synced!`);
            return;
        }

        if (commandTokens && commandTokens.length === 1 && commandTokens[0] === "manage") {
            // Command: refresh
            this._browser.navigateCurrentTab(this._browser.getExtensionUrl("options/index.html"));
            return;
        }

        if (commandTokens && commandTokens.length === 1 && commandTokens[0] !== "sv") {
            // Command: bookmarkkey
            this.performNavigation(commandTokens[0]);
            return;
        }
        
        if (commandTokens && commandTokens.length === 3 && commandTokens[0] === "sv") {
            // Command: sv bookmarkKey url
            commandTokens[1] = commandTokens[1].toLowerCase();
            this.saveBookmarkAndSync(commandTokens[1], commandTokens[2]);
            return;
        }
    
        // Command: sv bookmarkKey
        commandTokens[1] = commandTokens[1].toLowerCase();
        this._browser.getCurrentTabUrl()
            .then((url) => {
                // TODO: Display error?
                if (!url) {
                    return;
                }
    
                this.saveBookmarkAndSync(commandTokens[1], url);
            });
    }

    private inputChangedHandler(text: string, provideSuggestionsCallback: OmniboxProvideSuggestionsCallback): void {    
        this._bookmarkManager.getBookmarks()
        .then((bookmarks) => {
            var inputText = text.toLowerCase();
            if (inputText.startsWith("sv ")) {
                return;
            }
    
            // TODO: Tweak order of suggestions based on closest match - or most used.
            // simple 2-pass algorithm for now (first check for startsWith, second for includes and not already in the list).
            var filteredBookmarks = 
                bookmarks.filter(bkmark => bkmark.key.startsWith(inputText) || bkmark.url.startsWith(inputText));
    
            filteredBookmarks = filteredBookmarks.concat(
                bookmarks.filter(bkmark => {
                    let bookmarkInList = filteredBookmarks.find(innerBkmark => innerBkmark.key === bkmark.key);
                    if (bookmarkInList) {
                        return false;
                    }
    
                    return bkmark.key.includes(inputText) || bkmark.url.includes(inputText);
                })
            );
    
            if (!filteredBookmarks || filteredBookmarks.length <= 0) {
                return;
            }
    
            var suggestedBookmarks = 
                filteredBookmarks.map(bkmark => {
                    return { content: bkmark.key, description: _.escape(bkmark.key + ' - ') + '<url>' + _.escape(bkmark.url) + '</url>' };
                });
    
            provideSuggestionsCallback(suggestedBookmarks);
        });
    }    

    private saveBookmarkAndSync(bookmarkKey: string, url: string): void {
        this._bookmarkManager.saveBookmark(new Bookmark(bookmarkKey, url))
        .then(() => {
            this._browser.postNotification("Bookmark Saved", `Current url saved as bookmark: ${bookmarkKey}`);
            this.syncBookmarks();
        });
    }

    private syncBookmarks(): void {
        this._bookmarkManager.getBookmarks()
        .then((allBookmarks) => {
            this._syncService.synchronizeWithService(allBookmarks);
        });
    }
    
    private performNavigation(bookmarkKey: string) {
        this._bookmarkManager.getBookmark(bookmarkKey)
            .then((bookmark) => {
                if (!bookmark) {
                    this._browser.postNotification("Bookmark not found", `No bookmark could be found for ${bookmarkKey}`);
                    return;
                }
                if (!bookmark.url) {
                    this._browser.postNotification("Invalid bookmark", `${bookmarkKey} is an invalid bookmark`);
                    return;
                }
    
                this._browser.navigateCurrentTab(bookmark.url);
            });
    }
}
