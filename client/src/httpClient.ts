import { inject, injectable } from "inversify";
import { IApplicationSettings } from "./applicationSettings";
import { IAuthState } from "./authStateFactory";
import TYPES from "./dependencyInjection/types";
import { Bookmark } from "./models/bookmark";


export interface IHttpClient {
    postAuthStateToService(authState: IAuthState): Promise<Response>;
    postAccessTokenRequestToService(refreshToken: string): Promise<Response>
    postBookmarksArrayToServiceToSync(accessToken: string, bookmarks: Bookmark[]): Promise<Response>
}

@injectable()
export class HttpClient implements IHttpClient {

    constructor(
        @inject(TYPES.IApplicationSettings) private _appSettings: IApplicationSettings
    ) {}

    async postAuthStateToService(authState: IAuthState): Promise<Response> {
        let storageResp = await fetch(this._appSettings.Auth.StoreAuthStateUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(authState)
        });

        return storageResp;
    }

    async postAccessTokenRequestToService(refreshToken: string): Promise<Response> {
        const refreshAccessTokenRequest = {
            RefreshToken: refreshToken,
            ClientId: this._appSettings.Auth.ClientId,
            RedirectUrl: this._appSettings.Auth.RedirectUrl,
            Scopes: this._appSettings.Auth.BetterBookmarkScopes.join(" ")
        }

        let storageResp = await fetch(this._appSettings.Auth.RefreshAccessTokenUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(refreshAccessTokenRequest)
        });

        return storageResp;
    }

    async postBookmarksArrayToServiceToSync(accessToken: string, bookmarks: Bookmark[]): Promise<Response> {
        const resp = await fetch(this._appSettings.SyncUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(bookmarks),
            mode: "cors",
            cache: "no-store"
        });

        return resp;
    }
}