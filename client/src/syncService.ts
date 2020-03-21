import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { Bookmark } from './models/bookmark';
import { DecodedToken } from './types/decodedToken';
import { IBookmarkManager } from './bookmarkManager';
import { authConfig } from './auth.config';
import jwt_decode from 'jwt-decode';

export interface ISyncService {
    synchronizeWithService(bookmarksArray: Array<Bookmark>): void
}

// Note: This class can only function within the extension's backgroundPage (where it can access the stored auth token)
@injectable()
export class SyncService implements ISyncService {
    constructor(@inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager) { }

    synchronizeWithService(bookmarksArray: Array<Bookmark>) {
        let self = this;
        console.log(`fetching token for sync...`);
        this.getCachedAccessToken()
            .then((accessToken) => {
                if (!accessToken) {
                    return;
                }
            
                console.log(`token received - constructing request`);
                var req = new Request(
                    authConfig.SYNC_ENDPOINT,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify(bookmarksArray),
                        mode: "cors",
                        cache: "no-store"
                    }
                );
            
                // TODO: Implement success/error handling
                console.log(`initiating fetch...`);
                fetch(req)
                    .then(resp => {
                        console.log(`fetch response received - ${resp}`);
                        resp.json()
                            .then(bookmarks => {
                                console.log(`received bookmarks - ${bookmarks}`);
                                self._bookmarkManager.saveBookmarks(bookmarks);
                            });
                    });
            });
    }

    private getCachedAccessToken() {
        const authResult = JSON.parse(localStorage.authResult || '{}');
        const token = authResult.id_token;
        if (token) {
            if (this.isTokenActive(token))
                return Promise.resolve(authResult.access_token);
            return this.getAccessTokenUsingRefreshToken()
                .then((tokenRefreshAuthResult) => {
                    return tokenRefreshAuthResult && tokenRefreshAuthResult.access_token;
                });
        }
    
        return Promise.resolve(undefined);
    }

    private getAccessTokenUsingRefreshToken() {
        var browserFacade = new ChromeBrowser();
        return browserFacade.getRefreshToken()
            .then(refreshToken => {
                if (!refreshToken) {
                    return Promise.resolve(undefined);
                }
        
                var tokReqBody = {
                    "grant_type": "refresh_token",
                    "client_id": authConfig.AUTH0_CLIENT_ID,
                    "refresh_token": refreshToken
                };
        
                var req = new Request(
                    `https://${authConfig.AUTH0_DOMAIN}/oauth/token`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(tokReqBody),
                        mode: "cors",
                        cache: "no-store"
                    }
                );
            
                return fetch(req)
                    .then(resp => {
                        // TODO: Implement success/error handling
                        return resp.json()
                            .then(authResult => {
                                localStorage.authResult = JSON.stringify(authResult);
                                console.log('Token refresh succeeded.');
                                return authResult;
                            })
                            .catch(err => {
                                console.log('Token refresh failed - failed getting body.');
                                return undefined;
                            });
                    })
                    .catch(err => {
                        console.log('Token refresh failed.');
                        return undefined;
                    });
            });
    }

    private isTokenActive(token: string) {
        // The user is logged in if their token isn't expired
        let decodedToken = <DecodedToken> jwt_decode(token);
        return decodedToken.exp > Date.now() / 1000;
    }
}