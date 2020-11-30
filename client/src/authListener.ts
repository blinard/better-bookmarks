import { injectable, inject, interfaces } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { authConfig } from './auth.config';
import Auth0Chrome from 'auth0-chrome';
import { IBookmarkManager, BookmarkManager } from './bookmarkManager';
import { ISyncService } from './syncService';
import { BrowserFacade } from './browserFacades/browserFacade';
import { MSAAuthHelper, ResponseMode } from "./authentication/msaAuthHelper";
import { IPKCEChallengeAndVerifierFactory } from "./authentication/pkceChallengeAndVerifier";

export interface IAuthListener {
    addAuthListener(): void;
}

@injectable()
export class AuthListener implements IAuthListener {
    private _auth0: Auth0Chrome;

    constructor(
        @inject(TYPES.BrowserFacade) private _browser: BrowserFacade, 
        @inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager, 
        @inject(TYPES.ISyncService) private _syncService: ISyncService,
        @inject(TYPES.Auth0ChromeFactory) private _auth0Factory: () => Auth0Chrome,
        @inject(TYPES.IMSAAuthHelper) private _msaAuthHelper: MSAAuthHelper,
        @inject(TYPES.IPKCEChallengeAndVerifierFactory) private _pkceChallengeAndVerifierFactory: IPKCEChallengeAndVerifierFactory) {
            this._auth0 = _auth0Factory();
        }

    addAuthListener(): void {
        this._browser.addOnMessageListener(this.onMessageHandler.bind(this));
    }

    private async performAuthentication() {

        // Implementation based on: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
        const pkceChallengeAndVerfier = this._pkceChallengeAndVerifierFactory.getNewPKCEChallengeAndVerifier();
        const msaAuthorityScopes = ["openid", "profile", "offline_access"];
        const betterBookmarksScopes = ["api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"];
        const allScopes = [...msaAuthorityScopes, ...betterBookmarksScopes];
        const clientId = "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b";
        const redirectUri = chrome.identity.getRedirectURL('browserAction/browserAction.html')

        const authorizeUrl = await this._msaAuthHelper.getAuthorizeRequestUrl(
            clientId, redirectUri, ResponseMode.Fragment, allScopes, "54321", pkceChallengeAndVerfier);

        console.log("authorizeUrl: " + authorizeUrl);
        chrome.identity.launchWebAuthFlow({ url: authorizeUrl, interactive: true }, async (redirectResponseUrl) => {
            if (!redirectResponseUrl) {
                console.error("redirectUrl was empty, null or undefined");
                return;
            }

            console.log("redirectUrl: " + redirectResponseUrl);
            const hash = redirectResponseUrl.substring(redirectResponseUrl.indexOf("#") + 1);
            console.log("hash: " + hash);
            const responseValues: any = {};
            hash.split("&").forEach((kvp) => {
                const keyThenValueArray = kvp.split("=");
                responseValues[keyThenValueArray[0]] = keyThenValueArray[1];
            })

            const tokenRequestInfo = this._msaAuthHelper.getTokenRequestUrlUsingAuthCode(clientId, redirectUri, msaAuthorityScopes, responseValues.code, pkceChallengeAndVerfier);
            
            const resp = await fetch(tokenRequestInfo.url, tokenRequestInfo.fetchOptions);
            console.log(resp)
        });
    }

    private onMessageHandler(event: any) {
        const self = this;
        if (!event || !event.type || event.type !== 'authenticate') {
            return;
        }

        if (event.type === 'authenticate') {
            this.performAuthentication();
            return; 
        }

        // scope
        //  - openid if you want an id_token returned
        //  - offline_access if you want a refresh_token returned
        //  - profile if you want an additional claims like name, nickname, picture and updated_at.
        // device
        //  - required if requesting the offline_access scope.
        let options = {
            scope: 'openid profile offline_access',
            device: 'chrome-extension',
            audience: authConfig.AUDIENCE
        };
    
        self._auth0
            .authenticate(options)
            .then(function (authResult) {
                // TODO: Store in chrome.storage rather than localStorage.
                localStorage.authResult = JSON.stringify(authResult);
                self._browser.setRefreshToken(<string>authResult.refresh_token);
                self._browser.postNotification('Login Successful', 'Nice, you\'ve logged in!');
    
                console.log(`beginning bookmark sync`);
                self._bookmarkManager.getBookmarks()
                    .then((bookmarksArray) => {
                        console.log(`initiating sync - ${bookmarksArray}`);
                        self._syncService.synchronizeWithService(bookmarksArray);
                    });
            
            })
            .catch(function (err) {
                self._browser.postNotification('Login Failed', err.message);
            });
    }    
}
