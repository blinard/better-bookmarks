import {BrowserFacade} from './browserFacades/chromeBrowser';
import {Bookmark} from './models/bookmark';

export function addOmniboxListeners() {
    var browser = new BrowserFacade();
    browser.addOmniboxInputChangedListener(inputChangedHandler);
    browser.addOmniboxInputEnteredListener(inputEnteredHandler);
}

function inputChangedHandler(txt, provideSuggestionsCallback) {
    bookmarkManager.getBookmarks()
    .then((bookmarks) => {
        if (!txt.startsWith("go ") || txt.length < 4) {
            return;
        }

        var inputText = txt.replace("go ", "");

        var suggestedBookmarks = bookmarks
            .filter((bkmark) => {
                return bkmark.key.includes(inputText) || bkmark.url.includes(inputText);
            })
            .map((bkmark) => {
                return { content: 'go ' + bkmark.key, description: bkmark.key + ' - ' + bkmark.url }
            });

        provideSuggestionsCallback(suggestedBookmarks);
    });
}

function inputEnteredHandler(txt, inputEnteredDisposition) {
    // inputEnteredDisposition could be used to control url navigation tab behavior (currentTab, newForegroundTab, etc)
    // See: https://developer.chrome.com/extensions/omnibox#type-OnInputEnteredDisposition
    var entry = txt.toLowerCase().trim();
    if (entry.startsWith("go ")) {
        performGoNavigation(entry);
        return;
    }
    
    browserFacade.getCurrentTabUrl()
        .then((url) => {
            bookmarkManager.saveBookmark(new Bookmark(entry, url));
            browserFacade.postNotification("Bookmark Saved", `Current url saved as bookmark: ${entry}`, entry);
        });
}

function performGoNavigation(entry) {
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