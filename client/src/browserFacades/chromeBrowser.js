const CHROME_BOOKMARKS_KEY = "bb-bookmarks";
const CHROME_REFRESHTOKEN_KEY = "bb-refreshtoken";

export class BrowserFacade {

    // This event is fired each time the user updates the text in the omnibox,
    // as long as the extension's keyword mode is still active.
    addOmniboxInputChangedListener(inputChangedCallback) {
        chrome.omnibox.onInputChanged.addListener(inputChangedCallback);
    }

    // This event is fired with the user accepts the input in the omnibox.
    addOmniboxInputEnteredListener(inputEnteredCallback) {
        chrome.omnibox.onInputEntered.addListener(inputEnteredCallback);
    }

    addOnMessageListener(onMessageCallback) {
        chrome.runtime.onMessage.addListener(onMessageCallback);
    }

    //Pushes a chrome notification
    postNotification(title, message, key, iconUrl) {
        var opts = {
            type: "basic",
            title: title,
            message: message,
            iconUrl: iconUrl || "images/bb-icon.png"
        };
        chrome.notifications.create(key || "", opts);
    }

    getCurrentTabUrl() {
        return new Promise((resolve, reject) => {
            chrome.tabs.query(
                {active: true, currentWindow: true}, 
                (tabs) => {
                    if (!tabs || tabs.length === 0) {
                        reject('Current tab not found');
                        return;
                    }

                    resolve(tabs[0].url);
                }
            );
        });
    }

    navigateCurrentTab(url) {
        chrome.tabs.query(
            {active: true, currentWindow: true}, 
            (tabs) => {
                if (!tabs || tabs.length === 0) {
                    console.log("Current tab not found");
                    return;
                }
                chrome.tabs.update(tabs[0].id, { url: url });
            }
        );
    }

    getLocalBookmarksData() {
        var deferred = new Promise((resolve, reject) => {
            chrome.storage.local.get(CHROME_BOOKMARKS_KEY, (bookmarksObj) => {
                resolve((bookmarksObj && bookmarksObj[CHROME_BOOKMARKS_KEY]) || []);
            });
        });
        return deferred;
    }

    setLocalBookmarksData(bookmarksArray) {
        var deferred = new Promise((resolve, reject) => {
            var storageShim = {};
            storageShim[CHROME_BOOKMARKS_KEY] = bookmarksArray;
            chrome.storage.local.set(storageShim, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(true);
            });
        });
        return deferred;
    }

    getRefreshToken() {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(CHROME_REFRESHTOKEN_KEY, (refreshTokenObj) => {
                resolve((refreshTokenObj && refreshTokenObj[CHROME_REFRESHTOKEN_KEY]));
            });
        });
    }

    setRefreshToken(refreshToken) {
        var deferred = new Promise((resolve, reject) => {
            var storageShim = {};
            storageShim[CHROME_REFRESHTOKEN_KEY] = refreshToken;
            chrome.storage.local.set(storageShim, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(true);
            });
        });
        return deferred;
    }
}