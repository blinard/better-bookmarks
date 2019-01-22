// Note: This class can only function within the extension's backgroundPage (where it can access stored auth token)
export class SyncService {

    synchronizeWithService(bookmarksArray) {
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
            
                fetch(req)
                    .then(resp => {
                        // TODO: Implement success/error handling
                        //resp.json()?
                    });
            });
    }

    _getCachedAccessToken() {
        const authResult = JSON.parse(localStorage.authResult || '{}');
        const token = authResult.id_token;
        // TODO: Add refresh token logic
        if (token) {
            // if (this._isLoggedIn(token))
            //     return Promise.resolve(authResult.access_token);
            return this._getAccessTokenUsingRefreshToken()
                .then((tokenRefreshAuthResult) => {
                    return tokenRefreshAuthResult && tokenRefreshAuthResult.access_token;
                });
        }
    
        return Promise.resolve(undefined);
    }

    _getAccessTokenUsingRefreshToken() {
        const authResult = JSON.parse(localStorage.authResult || '{}');
        if (!(authResult && authResult.refresh_token)) {
            return Promise.resolve(undefined);
        }

        var tokReqBody = {
            "grant_type": "refresh_token",
            "client_id": authEnv.AUTH0_CLIENT_ID,
            "refresh_token": authResult.refresh_token
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
    }

    _trySilentAuth() {
        // scope
        //  - openid if you want an id_token returned
        //  - offline_access if you want a refresh_token returned
        //  - profile if you want an additional claims like name, nickname, picture and updated_at.
        // device
        //  - required if requesting the offline_access scope.
        let options = {
            scope: 'openid profile offline_access',
            device: 'chrome-extension',
            audience: 'https://betterbookmarks.com/api'
        };

        return new Auth0Chrome(authEnv.AUTH0_DOMAIN, authEnv.AUTH0_CLIENT_ID)
            .authenticate(options, false)
            .then(function (authResult) {
                localStorage.authResult = JSON.stringify(authResult);
                // browserFacade.postNotification('Login Successful', 'Nice, you\'ve logged in!');
                console.log('Silent authentication succeeded.');
                return authResult;
            })
            .catch(function (err) {
                //browserFacade.postNotification('Login Failed', err.message);
                console.log('Silent authentication failed.');
                return undefined;
            });
    }

    _isLoggedIn(token) {
        // The user is logged in if their token isn't expired
        return jwt_decode(token).exp > Date.now() / 1000;
    }
}