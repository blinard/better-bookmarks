import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { Bookmark } from './models/bookmark';
import * as jwtDecode from 'jwt-decode';
import { DecodedToken } from './types/decodedToken';
import { authEnv } from './authEnv';

// Note: This class can only function within the extension's backgroundPage (where it can access stored auth token)
export class SyncService {

    synchronizeWithService(bookmarksArray: Array<Bookmark>) {
        this._getCachedAccessToken()
            .then((accessToken) => {
                if (!accessToken) {
                    return;
                }
            
                // TODO: Swap in Url from Config.
                var req = new Request(
                    "https://e0a13859.ngrok.io/api/bookmarks/sync",
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
                fetch(req)
                    .then(resp => {
                        //resp.json()?
                    });
            });
    }

    _getCachedAccessToken() {
        const authResult = JSON.parse(localStorage.authResult || '{}');
        const token = authResult.id_token;
        // TODO: Add refresh token logic
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
        return jwtDecode<DecodedToken>(token).exp > Date.now() / 1000;
    }
}