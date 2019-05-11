import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { Bookmark } from './models/bookmark';
import { DecodedToken } from './types/decodedToken';
import { BookmarkManager } from './bookmarkManager';
import { authEnv } from './authEnv';
import jwt_decode from 'jwt-decode';

// Note: This class can only function within the extension's backgroundPage (where it can access stored auth token)
export class SyncService {

    synchronizeWithService(bookmarksArray: Array<Bookmark>) {
        console.log(`fetching token for sync...`);
        this._getCachedAccessToken()
            .then((accessToken) => {
                if (!accessToken) {
                    return;
                }
            
                console.log(`token received - constructing request`);
                var req = new Request(
                    authEnv.SYNC_ENDPOINT,
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
                                let mgr = new BookmarkManager();
                                mgr.saveBookmarks(bookmarks);
                            });
                    });
            });
    }

    _getCachedAccessToken() {
        const authResult = JSON.parse(localStorage.authResult || '{}');
        const token = authResult.id_token;
        if (token) {
            if (this._isTokenActive(token))
                return Promise.resolve(authResult.access_token);
            return this._getAccessTokenUsingRefreshToken()
                .then((tokenRefreshAuthResult) => {
                    return tokenRefreshAuthResult && tokenRefreshAuthResult.access_token;
                });
        }
    
        return Promise.resolve(undefined);
    }

    _getAccessTokenUsingRefreshToken() {
        var browserFacade = new ChromeBrowser();
        return browserFacade.getRefreshToken()
            .then(refreshToken => {
                if (!refreshToken) {
                    return Promise.resolve(undefined);
                }
        
                var tokReqBody = {
                    "grant_type": "refresh_token",
                    "client_id": authEnv.AUTH0_CLIENT_ID,
                    "refresh_token": refreshToken
                };
        
                var req = new Request(
                    `https://${authEnv.AUTH0_DOMAIN}/oauth/token`,
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

    _isTokenActive(token: string) {
        // The user is logged in if their token isn't expired
        let decodedToken = <DecodedToken> jwt_decode(token);
        return decodedToken.exp > Date.now() / 1000;
    }
}