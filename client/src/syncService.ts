import { injectable, inject } from "inversify";
import "reflect-metadata";
import TYPES from "./dependencyInjection/types";

import { Bookmark } from './models/bookmark';
import { DecodedToken } from './types/decodedToken';
import { IBookmarkManager } from './bookmarkManager';
import jwt_decode from 'jwt-decode';
import { IAuthManager } from "./authentication/authManager";
import { IHttpClient } from "./httpClient";

export interface ISyncService {
    synchronizeWithService(bookmarksArray: Array<Bookmark>): Promise<boolean>
}

// Note: This class can only function within the extension's backgroundPage (where it can access the stored auth token)
@injectable()
export class SyncService implements ISyncService {
    constructor(
        @inject(TYPES.IBookmarkManager) private _bookmarkManager: IBookmarkManager,
        @inject(TYPES.IAuthManager) private _authManager: IAuthManager,
        @inject(TYPES.IHttpClient) private _httpClient: IHttpClient
        ) { }

    async synchronizeWithService(bookmarksArray: Array<Bookmark>): Promise<boolean> {
        let self = this;
        console.log(`fetching token for sync...`);
        const authResult = await this._authManager.acquireTokenSilent();
        if (!authResult || !authResult.access_token) {
            throw new Error("AuthResult not received or invalid. Cannot sync bookmarks");
        }

        console.log(`token received - syncing bookmarks`);
        const syncResp = await this._httpClient.postBookmarksArrayToServiceToSync(authResult.access_token, bookmarksArray);
        if (!syncResp.ok) {
            throw new Error("Bookmark sync with the service failed.")
        }

        const bookmarks = await syncResp.json();
        console.log(`received bookmarks - ${bookmarks}`);
        self._bookmarkManager.saveBookmarks(bookmarks);

        return true;
    }

    private isTokenActive(token: string) {
        // The user is logged in if their token isn't expired
        let decodedToken = <DecodedToken> jwt_decode(token);
        return decodedToken.exp > Date.now() / 1000;
    }
}