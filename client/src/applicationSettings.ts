import { injectable } from "inversify"

export interface IApplicationSettings {
    readonly UrlBase: string
    readonly SyncUrl: string
    readonly Auth: IAuthSettings
}

export interface IAuthSettings {
    readonly ClientId: string
    readonly MsaAuthorityScopes: Array<string>
    readonly BetterBookmarkScopes: Array<string>
    readonly RedirectUrl: string
    readonly StoreAuthStateUrl: string
    readonly RefreshAccessTokenUrl: string
}

@injectable()
export class ApplicationSettings implements IApplicationSettings {
    constructor() {}

    /*
        New ngrok url? There are 3 places that you need to update it:
        1. Here. The UrlBase.
        2. In the manifest.json of the client application (for the content script)
        3. In the AAD App registration. As an allowed redirect url for the mobile authentication.
    */
    readonly UrlBase: string = "https://bbfunction.azurewebsites.net";
    readonly SyncUrl: string = this.UrlBase + "/api/Sync";
    readonly Auth: IAuthSettings = {
        ClientId: "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b",
        MsaAuthorityScopes: ["openid", "profile", "offline_access"],
        BetterBookmarkScopes: ["api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"],
        RedirectUrl: this.UrlBase + "/api/CompleteInteractiveAuth",
        StoreAuthStateUrl: this.UrlBase + "/api/StoreAuthState",
        RefreshAccessTokenUrl: this.UrlBase + "/api/RefreshAccessToken"
    };
}
