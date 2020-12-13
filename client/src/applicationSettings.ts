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

    readonly UrlBase: string = "https://81698c771334.ngrok.io"; //"https://bbfunction.azurewebsites.net";
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
