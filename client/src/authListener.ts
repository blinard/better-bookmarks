import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { IBookmarkManager } from './bookmarkManager';
import { ISyncService } from './syncService';
import { BrowserFacade } from './browserFacades/browserFacade';
import { IOAuthResponse } from "./authentication/msaAuthHelper";
import { IAuthManager, IAuthResult } from "./authentication/authManager";

export interface IAuthListener {
    addAuthListener(): void;
}

@injectable()
export class AuthListener implements IAuthListener {

    constructor(
        @inject(TYPES.BrowserFacade) private _browser: BrowserFacade, 
        @inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager, 
        @inject(TYPES.ISyncService) private _syncService: ISyncService,
        @inject(TYPES.IAuthManager) private _authManager: IAuthManager
        ) { }

    addAuthListener(): void {
        this._browser.addOnMessageListener(this.onMessageHandler.bind(this));
    }

    private onMessageHandler(event: any) {
        const self = this;
        if (!event || !event.type) {
            return;
        }

        if (event.type === 'initiateInteractiveAuth') {
            this._authManager.initiateInteractiveLogin();
            return; 
        }

        if (event.type === 'acquireTokenSilent') {
            this.getTokenSilent();
            return; 
        }

        if(event.type === "interactiveAuthResponse") {
            this.handleInteractiveAuthResponse(event);
            console.log(`beginning bookmark sync`);
            self._bookmarkManager.getBookmarks()
                .then((bookmarksArray) => {
                    console.log(`initiating sync - ${bookmarksArray}`);
                    self._syncService.synchronizeWithService(bookmarksArray);
                });
        
            return;
        }
    }    

    private async getTokenSilent() {
        // TODO: Put acquireTokenSilent in try/catch and deal with errors (and send appropriate response in an error scenario)
        const authResult = await this._authManager.acquireTokenSilent();
        const getTokenSilentResp = {
            type: "silentAuthResult"
        }
        if (authResult) {
            getTokenSilentResp["authResult"] = {
                ...authResult,
                name: "Timmy!"
            }
        }

        chrome.runtime.sendMessage(getTokenSilentResp); // TODO: Move to browserfacade.
    }

    // TODO: Move this function into the authManager
    private handleInteractiveAuthResponse(event: any) {
        const oauthResp: IOAuthResponse = JSON.parse(event.authResponse);;

        const access_token_expiration = new Date();
        // TODO: Parse token and acquire actual expiration time plus name
        // Note: Padding the expiration by 5 minutes. Typically it's 1 hour expiration
        access_token_expiration.setSeconds(access_token_expiration.getSeconds() + oauthResp.expires_in - 300);
        const myResponse: IAuthResult = {
            //bbUserId: "tbd", //tid+oid claims in the token
            ...oauthResp,
            access_token_expiration,
            name: "tbd" // TODO: parse the access_token or id_token and acquire the name property.
        };

        this._browser.setCachedAuthResult(myResponse);
        return myResponse;
    }
}
