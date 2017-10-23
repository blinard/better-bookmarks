import { injectable } from "inversify";
import "reflect-metadata";
import { IBookmarkDataAccess } from "bb.dataaccess";
import * as Rx from "rxjs/Rx";
import { BookmarkMap, OmniboxInputChangedData, OmniboxObservables } from "bb.models";
import { IBrowserFacade } from "bb.business";

@injectable()
export class ChromeFacade implements IBrowserFacade, IBookmarkDataAccess {
    constructor() {
    }

    addOmniboxListeners(): OmniboxObservables {
        let inputChangedObservable = Rx.Observable.create((observer: Rx.Observer<OmniboxInputChangedData>) => {
            let inputChangedCallback = (text: string, suggest: (suggestions: chrome.omnibox.SuggestResult[]) => void) => {
                observer.next(new OmniboxInputChangedData(text, suggest));
            };

            // This event is fired each time the user updates the text in the omnibox,
            // as long as the extension's keyword mode is still active.
            chrome.omnibox.onInputChanged.addListener(inputChangedCallback);
        });

        let inputEnteredObservable = Rx.Observable.create((observer: Rx.Observer<string>) => {
            let inputEnteredCallback = (text: string) => {
                observer.next(text);
            };

            // This event is fired with the user accepts the input in the omnibox.
            chrome.omnibox.onInputEntered.addListener(inputEnteredCallback);
        });
        
        return new OmniboxObservables(inputChangedObservable, inputEnteredObservable);
    }

    postNotification(title: string, message: string, key?: string, iconUrl?: string): void {
        let opts: chrome.notifications.NotificationOptions = {
            type: "basic",
            title: title,
            message: message,
            iconUrl: iconUrl || "bb-icon.png"
        };
        chrome.notifications.create(key, opts);
    }

    getCurrentTabUrl(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (!tabs || tabs.length === 0) {
                    reject('Current tab not found');
                    return;
                }

                resolve(tabs[0].url);
            });
        });
    }

    navigateCurrentTab(url: string): void {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs || tabs.length === 0) {
                console.log("Current tab not found");
                return;
            }
            chrome.tabs.update(tabs[0].id, { url: url });
        });
    }

    getData(): Promise<BookmarkMap> {
        let deferred = new Promise<BookmarkMap>((resolve, reject) => {
            chrome.storage.local.get((bookmarkMap: BookmarkMap) => {
                resolve(bookmarkMap);
                //reject(chrome.runtime.lastError);
            });
        });
        return deferred;
    }

    setData(bookmarkMap: BookmarkMap): Promise<boolean> {
        let deferred = new Promise<boolean>((resolve, reject) => {
            chrome.storage.local.set(bookmarkMap, () => {
                resolve(true);
            });
        });
        return deferred;
    }
}