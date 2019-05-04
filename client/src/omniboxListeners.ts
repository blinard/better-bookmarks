import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { BookmarkManager } from './bookmarkManager';
import { Bookmark } from './models/bookmark';
import { SyncService } from './syncService';
import { OmniboxProvideSuggestionsCallback, BrowserFacade } from './browserFacades/browserFacade';

export function addOmniboxListeners() {
    var browser = new ChromeBrowser();
    browser.addOmniboxInputChangedListener(inputChangedHandler);
    browser.addOmniboxInputEnteredListener(inputEnteredHandler);
}

export function inputChangedHandler(text: string, provideSuggestionsCallback: OmniboxProvideSuggestionsCallback): void {
    var browserFacade = new ChromeBrowser();
    var bookmarkManager = new BookmarkManager();

    // TODO: Add caching for this getBookmarks call.
    bookmarkManager.getBookmarks()
    .then((bookmarks) => {
        if (!text.startsWith("go ") || text.length < 4) {
            return;
        }

        var inputText = text.replace("go ", "").toLowerCase();

        // TODO: Tweak order of suggestions based on closest match
        // simple 2-pass algorithm for now (first check for startsWith, second for includes and not already in the list).
        var filteredBookmarks = 
            bookmarks.filter(bkmark => bkmark.key.startsWith(inputText) || bkmark.url.startsWith(inputText));

        filteredBookmarks.concat(
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
            filteredBookmarks.map(bkmark => ({ content: 'go ' + bkmark.key, description: bkmark.key + ' - ' + bkmark.url }));

        provideSuggestionsCallback(suggestedBookmarks);
    });
}

export function inputEnteredHandler(text: string, disposition: chrome.omnibox.OnInputEnteredDisposition): void {
    var browserFacade = new ChromeBrowser();
    var bookmarkManager = new BookmarkManager();

    // inputEnteredDisposition could be used to control url navigation tab behavior (currentTab, newForegroundTab, etc)
    // See: https://developer.chrome.com/extensions/omnibox#type-OnInputEnteredDisposition
    var entry = text.toLowerCase().trim();
    if (entry.startsWith("go ")) {
        performGoNavigation(entry, browserFacade, bookmarkManager);
        return;
    }
    
    browserFacade.getCurrentTabUrl()
        .then((url) => {
            // TODO: Display error?
            if (!url) {
                return;
            }

            bookmarkManager.saveBookmark(new Bookmark(entry, url))
                .then(() => {
                    browserFacade.postNotification("Bookmark Saved", `Current url saved as bookmark: ${entry}`);
                    bookmarkManager.getBookmarks()
                        .then((allBookmarks) => {
                            var syncService = new SyncService();
                            syncService.synchronizeWithService(allBookmarks);
                        });
                });
        });
}

function performGoNavigation(entry: string, browserFacade: BrowserFacade, bookmarkManager: BookmarkManager) {
    var key = entry.replace("go ", "");
    bookmarkManager.getBookmark(key)
        .then((bookmark) => {
            if (!bookmark) {
                browserFacade.postNotification("Bookmark not found", `No bookmark could be found for ${key}`);
                return;
            }
            if (!bookmark.url) {
                browserFacade.postNotification("Invalid bookmark", `${key} is an invalid bookmark`);
                return;
            }

            browserFacade.navigateCurrentTab(bookmark.url);
        });
}