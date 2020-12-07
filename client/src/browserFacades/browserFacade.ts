import { IAuthResult } from "src/authentication/authManager";
import {Bookmark} from "../models/bookmark";

export type OmniboxProvideSuggestionsCallback = (suggestions: chrome.omnibox.SuggestResult[]) => void;
export type OmniboxInputChangedCallback = (text: string, provideSuggestionsCallback: OmniboxProvideSuggestionsCallback) => void;
export type OmniboxInputEnteredCallback = (text: string, disposition: chrome.omnibox.OnInputEnteredDisposition) => void;
export type OnMessageCallback = (message: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) => void;

export interface BrowserFacade {

    addOmniboxInputChangedListener(inputChangedCallback: OmniboxInputChangedCallback) : void;
    addOmniboxInputEnteredListener(inputEnteredCallback: OmniboxInputEnteredCallback): void;
    addOnMessageListener(onMessageCallback: OnMessageCallback): void;
    postNotification(title: string, message: string, key?: string, iconUrl?: string): void;
    getCurrentTabUrl(): Promise<string | undefined>
    navigateCurrentTab(url: string): void;
    getLocalBookmarksData(): Promise<Array<Bookmark>>;
    setLocalBookmarksData(bookmarks: Array<Bookmark>): Promise<boolean | chrome.runtime.LastError>;
    getRefreshToken(): Promise<string | undefined>;
    setRefreshToken(refreshToken: string): Promise<boolean | chrome.runtime.LastError>;
    getCachedAuthResult(): Promise<IAuthResult | undefined>;
    setCachedAuthResult(authResult: IAuthResult): Promise<boolean>;
}