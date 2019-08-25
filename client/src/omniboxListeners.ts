import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { BookmarkManager } from './bookmarkManager';
import { Bookmark } from './models/bookmark';
import { SyncService } from './syncService';
import { OmniboxProvideSuggestionsCallback, BrowserFacade } from './browserFacades/browserFacade';
import * as _ from 'lodash';

export function addOmniboxListeners() {
    var browser = new ChromeBrowser();
    browser.addOmniboxInputChangedListener(inputChangedHandler);
    browser.addOmniboxInputEnteredListener(inputEnteredHandler);
}

export function inputChangedHandler(text: string, provideSuggestionsCallback: OmniboxProvideSuggestionsCallback): void {
    var bookmarkManager = new BookmarkManager();

    bookmarkManager.getBookmarks()
    .then((bookmarks) => {
        var inputText = text.toLowerCase();
        if (inputText.startsWith("sv ")) {
            return;
        }

        // TODO: Tweak order of suggestions based on closest match
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

export function inputEnteredHandler(text: string, disposition: chrome.omnibox.OnInputEnteredDisposition): void {
    var browserFacade = new ChromeBrowser();
    var bookmarkManager = new BookmarkManager();

    // inputEnteredDisposition could be used to control url navigation tab behavior (currentTab, newForegroundTab, etc)
    // See: https://developer.chrome.com/extensions/omnibox#type-OnInputEnteredDisposition
    var bookmarkKey = text.toLowerCase().trim();
    if (!bookmarkKey.startsWith("sv ")) {
        performNavigation(bookmarkKey, browserFacade, bookmarkManager);
        return;
    }
    
    bookmarkKey = bookmarkKey.replace("sv ", "");
    browserFacade.getCurrentTabUrl()
        .then((url) => {
            // TODO: Display error?
            if (!url) {
                return;
            }

            bookmarkManager.saveBookmark(new Bookmark(bookmarkKey, url))
                .then(() => {
                    browserFacade.postNotification("Bookmark Saved", `Current url saved as bookmark: ${bookmarkKey}`);
                    bookmarkManager.getBookmarks()
                        .then((allBookmarks) => {
                            var syncService = new SyncService();
                            syncService.synchronizeWithService(allBookmarks);
                        });
                });
        });
}

function performNavigation(bookmarkKey: string, browserFacade: BrowserFacade, bookmarkManager: BookmarkManager) {
    bookmarkManager.getBookmark(bookmarkKey)
        .then((bookmark) => {
            if (!bookmark) {
                browserFacade.postNotification("Bookmark not found", `No bookmark could be found for ${bookmarkKey}`);
                return;
            }
            if (!bookmark.url) {
                browserFacade.postNotification("Invalid bookmark", `${bookmarkKey} is an invalid bookmark`);
                return;
            }

            browserFacade.navigateCurrentTab(bookmark.url);
        });
}