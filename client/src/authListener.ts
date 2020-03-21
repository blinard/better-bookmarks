import { injectable, inject, interfaces } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { authConfig } from './auth.config';
import Auth0Chrome from 'auth0-chrome';
import { IBookmarkManager, BookmarkManager } from './bookmarkManager';
import { ISyncService } from './syncService';
import { BrowserFacade } from './browserFacades/browserFacade';

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
        @inject(TYPES.Auth0ChromeFactory) private _auth0Factory: () => Auth0Chrome) {
            this._auth0 = _auth0Factory();
        }

    addAuthListener(): void {
        this._browser.addOnMessageListener(this.onMessageHandler.bind(this));
    }

    private onMessageHandler(event: any) {
        const self = this;
        if (!event || !event.type || event.type !== 'authenticate') {
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
