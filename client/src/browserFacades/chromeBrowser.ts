import {BrowserFacade, OmniboxInputChangedCallback, OnMessageCallback, OmniboxInputEnteredCallback} from "./browserFacade";
import { Bookmark } from "../models/bookmark";
import { Dictionary } from "../types/dictionary";
import { injectable } from "inversify";
import { IAuthResult } from "../authentication/authManager";

const CHROME_BOOKMARKS_KEY = "bb-bookmarks";
const CHROME_REFRESHTOKEN_KEY = "bb-refreshtoken";
const CHROME_AUTHRESULT_KEY = "bb-authresult";

@injectable()
export class ChromeBrowser implements BrowserFacade {

    // This event is fired each time the user updates the text in the omnibox,
    // as long as the extension's keyword mode is still active.
    addOmniboxInputChangedListener(inputChangedCallback: OmniboxInputChangedCallback): void {
        chrome.omnibox.onInputChanged.addListener(inputChangedCallback);
    }

    // This event is fired with the user accepts the input in the omnibox.
    addOmniboxInputEnteredListener(inputEnteredCallback: OmniboxInputEnteredCallback): void {
        chrome.omnibox.onInputEntered.addListener(inputEnteredCallback);
    }

    addOnMessageListener(onMessageCallback: OnMessageCallback): void {
        chrome.runtime.onMessage.addListener(onMessageCallback);
    }

    //Pushes a chrome notification
    postNotification(title: string, message: string, key?: string, iconUrl?: string): void {
        var opts = {
            type: "basic",
            title: title,
            message: message,
            iconUrl: iconUrl || "images/bb-icon.png"
        };
        chrome.notifications.create(key || "", opts);
    }

    getCurrentTabUrl(): Promise<string | undefined> {
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

    navigateCurrentTab(url: string): void {
        chrome.tabs.query(
            {active: true, currentWindow: true}, 
            (tabs) => {
                if (!tabs || tabs.length === 0 || tabs[0].id === undefined) {
                    console.log("Current tab not found");
                    return;
                }
                chrome.tabs.update(<number>tabs[0].id, { url: url });
            }
        );
    }

    navigateNewTab(url: string): void {
        chrome.tabs.create({ url: url });
    }

    getLocalBookmarksData(): Promise<Array<Bookmark>> {
        var deferred = new Promise<Array<Bookmark>>((resolve, reject) => {
            chrome.storage.local.get(CHROME_BOOKMARKS_KEY, (bookmarksObj) => {
                resolve((bookmarksObj && bookmarksObj[CHROME_BOOKMARKS_KEY]) || []);
            });
        });
        return deferred;
    }

    setLocalBookmarksData(bookmarksArray: Array<Bookmark>): Promise<boolean | chrome.runtime.LastError> {
        var deferred = new Promise<boolean | chrome.runtime.LastError>((resolve, reject) => {
            let storageShim: Dictionary<Array<Bookmark>> = {};
            storageShim[CHROME_BOOKMARKS_KEY] = (<any>bookmarksArray);
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

    getRefreshToken(): Promise<string | undefined> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(CHROME_REFRESHTOKEN_KEY, (refreshTokenObj) => {
                resolve((refreshTokenObj && refreshTokenObj[CHROME_REFRESHTOKEN_KEY]));
            });
        });
    }

    setRefreshToken(refreshToken: string): Promise<boolean | chrome.runtime.LastError> {
        var deferred = new Promise<boolean | chrome.runtime.LastError>((resolve, reject) => {
            let storageShim: Dictionary<string> = {};
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

    getCachedAuthResult(): Promise<IAuthResult | undefined> {
        return new Promise((resolve, reject) => {
            chrome.storage.local.get(CHROME_AUTHRESULT_KEY, (cacheObject) => {
                const result: IAuthResult = (cacheObject && cacheObject[CHROME_AUTHRESULT_KEY]);
                if (!result) return result;
                result.access_token_expiration = new Date(<number>result.access_token_expiration_val);
                resolve(result);
            });
        });
    }

    setCachedAuthResult(authResult: IAuthResult): Promise<boolean> {
        authResult.access_token_expiration_val = authResult.access_token_expiration.valueOf();
        return new Promise<boolean>((resolve, reject) => {
            let storageShim: Dictionary<object> = {};
            storageShim[CHROME_AUTHRESULT_KEY] = authResult
            chrome.storage.local.set(storageShim, () => {
                if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                    return;
                }

                resolve(true);
            });
        });
    }

    setBrowserActionIconDisabled(): void {
        chrome.browserAction.setIcon({ path: "../images/bb-icon-disabled.png" });
    }

    setBrowserActionIconEnabled(): void {
        chrome.browserAction.setIcon({ path: "../images/bb-icon.png" });
    }

    getExtensionUrl(path: string): string {
        return chrome.runtime.getURL(path);
    }
}