import { injectable, inject, interfaces } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { authConfig } from './auth.config';
import Auth0Chrome from 'auth0-chrome';
import { IBookmarkManager, BookmarkManager } from './bookmarkManager';
import { ISyncService } from './syncService';
import { BrowserFacade } from './browserFacades/browserFacade';
import { IOAuthResponse, IMSAAuthHelper, ResponseMode } from "./authentication/msaAuthHelper";
import { IPKCEChallengeAndVerifierFactory } from "./authentication/pkceChallengeAndVerifier";
import { IBase64Encode } from "./authentication/base64Encode";
import { IBrowserStringUtils } from "./authentication/browserStringUtils";
import { IAuthManager, IAuthResult } from "./authentication/authManager";

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
        @inject(TYPES.IAuthManager) private _authManager: IAuthManager
        ) {
            this._auth0 = _auth0Factory();
        }

    addAuthListener(): void {
        this._browser.addOnMessageListener(this.onMessageHandler.bind(this));
    }

    private async performAuthentication() {
        const authResult = await this._authManager.loginInteractive();

        const performAuthResp = {
            type: "authenticationResult"
        }
        if (authResult) {
            performAuthResp["authResult"] = {
                ...authResult,
                name: "Timmy!"
            }
        }
        
        chrome.runtime.sendMessage(performAuthResp);
    }

    private async getTokenSilent() {
        const authResult = await this._authManager.acquireToken();
        const getTokenSilentResp = {
            type: "authenticationResult"
        }
        if (authResult) {
            getTokenSilentResp["authResult"] = {
                ...authResult,
                name: "Timmy!"
            }
        }

        chrome.runtime.sendMessage(getTokenSilentResp);
    }

    private handleInteractiveAuthResponse(event: any) {
        const oauthResp: IOAuthResponse = JSON.parse(event.authResponse);;
        console.log("token below:");
        console.log(oauthResp);

        const access_token_expiration = new Date();
        // Note: Padding the expiration by 5 minutes. Typically it's 1 hour expiration
        access_token_expiration.setSeconds(access_token_expiration.getSeconds() + oauthResp.expires_in - 300);
        const refresh_token_expiration = new Date();
        // Note: Typically refresh tokens are valid for 24 hrs. Padding the expiration by 2 hrs.
        // Note: It'd be nice to be able to get a concrete expiry time on this.
        // Note: Since this token is from a 'mobile app' - it should last much longer now.
        refresh_token_expiration.setHours(refresh_token_expiration.getHours() + 1000);
        const myResponse: IAuthResult = {
            //bbUserId: "tbd", //tid+oid claims in the token
            ...oauthResp,
            access_token_expiration,
            refresh_token_expiration,
            name: "tbd" // TODO: parse the access_token or id_token and acquire the name property.
        };

        console.log("myResponse");
        console.log(myResponse);
        this._browser.setCachedAuthResult(myResponse);
        return myResponse;
    }

    private onMessageHandler(event: any) {
        const self = this;
        if (!event || !event.type) {
            return;
        }

        if (event.type === 'authenticate') {
            this.performAuthentication();
            return; 
        }

        if (event.type === 'acquireTokenSilent') {
            this.getTokenSilent();
            return; 
        }

        if(event.type === "authResponse") {
            this.handleInteractiveAuthResponse(event);
            return;
        }


        return;
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
