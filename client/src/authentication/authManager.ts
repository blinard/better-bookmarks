import { inject, injectable } from "inversify";
import { IGuidFactory } from "../guidFactory";
import { IApplicationSettings } from "../applicationSettings";
import { BrowserFacade } from "../browserFacades/browserFacade";
import TYPES from "../dependencyInjection/types";
import { IMSAAuthHelper, ResponseMode, IOAuthResponse } from "./msaAuthHelper";
import { IPKCEChallengeAndVerifierFactory, IPKCEVerifierProvider } from "./pkceChallengeAndVerifier";
import { IAuthStateFactory } from "../authStateFactory";
import { IHttpClient } from "../httpClient";

export interface IAuthManager {
    initiateInteractiveLogin(): Promise<boolean>;
    acquireTokenSilent(): Promise<IAuthResult>;
}

export interface IAuthResult {
    access_token: string
    id_token: string
    refresh_token: string
    scope: string
    token_type: string
    access_token_expiration: Date
    access_token_expiration_val?: number
    name: string
}

@injectable()
export class AuthManager implements IAuthManager {

    constructor(
        @inject(TYPES.IMSAAuthHelper) private _msaAuthHelper: IMSAAuthHelper,
        @inject(TYPES.IPKCEChallengeAndVerifierFactory) private _pkceChallengeAndVerifierFactory: IPKCEChallengeAndVerifierFactory,
        @inject(TYPES.BrowserFacade) private _browserFacade: BrowserFacade,
        @inject(TYPES.IApplicationSettings) private _appSettings: IApplicationSettings,
        @inject(TYPES.IGuidFactory) private _guidFactory: IGuidFactory,
        @inject(TYPES.IAuthStateFactory) private _authStateFactory: IAuthStateFactory,
        @inject(TYPES.IHttpClient) private _httpClient: IHttpClient
    ) {}

    /*
        Chrome Extension auth as Mobile app Overall process:

        1. Extension does post to bbfunction sending auth state (state key and bits for pkce verifier) https://bbfunction.azurewebsites.net/api/StoreAuthState
        2. Extension creates authorize url (with pkce challenge and uses redirect_uri of https://bbfunction.azurewebsites.net/api/CompleteInteractiveAuth), opens new tab and navigates to authorize url
        3. User auths, auth flow redirects to https://bbfunction.azurewebsites.net/api/CompleteInteractiveAuth
        4. Function accepts state key and code, looks up code verifier by state key, issues request for access and refresh token, receives tokens, provides them in the html response.
        5. Extension acquires tokens via CompleteInteractiveAuth response and extension content script that accesses token response from dom and sends it to background page via extension web messaging
        6. Extension uses tokens, including refresh_token. 
        7. When Extension needs a new access token it calls https://bbfunction.azurewebsites.net/api/RefreshAccessToken, provides the refresh token. Function acquires new access token (and possibly refresh token) and returns the response.
        8. See the bb-msa-auth.drawio file docs folder for a sequence diagram.

        Implementation inspired by: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
    */

    async initiateInteractiveLogin(): Promise<boolean> {
        // Section: Creates and stores auth state
        const pkceChallengeAndVerfier = this._pkceChallengeAndVerifierFactory.getNewPKCEChallengeAndVerifier();
        const stateKey = this._guidFactory.getGuid();
        const authState = this._authStateFactory.getAuthState(stateKey, pkceChallengeAndVerfier);

        const storageResp = await this._httpClient.postAuthStateToService(authState);
        if (!storageResp.ok) {
            throw new Error("StoreAuthState call failed");
        }

        // Section: Initiates auth with Authorize call (that is redirected to service).
        const allScopes = [...this._appSettings.Auth.MsaAuthorityScopes, ...this._appSettings.Auth.BetterBookmarkScopes];
        const authorizeUrl = await this._msaAuthHelper.getAuthorizeRequestUrl(
            this._appSettings.Auth.ClientId, 
            this._appSettings.Auth.RedirectUrl, 
            ResponseMode.Query, 
            allScopes, 
            stateKey, 
            pkceChallengeAndVerfier
            );

        console.log("authorizeUrl: " + authorizeUrl);
        this._browserFacade.navigateNewTab(authorizeUrl);
        return true;
    }

    async acquireTokenSilent(): Promise<IAuthResult> {
        console.log("Attempting to acquire token...");
        // Fetch most recent full response token from cache.
        // If it doesn't exist, do the full silent auth flow (if that fails, admit defeat and display the signed out ux)
        const cachedAuthResult = await this._browserFacade.getCachedAuthResult();
        if (!cachedAuthResult) {
            throw new Error("Cached auth token not found. Cannot perform silent auth.")
        }

        // If it's not expired, return it
        const now = new Date();
        if (now <= cachedAuthResult.access_token_expiration && cachedAuthResult.access_token) {
            console.log("Cached token is good, returning cached token");
            return cachedAuthResult
        }

        // Cached access_token is expired. Try refreshing it.
        if (!cachedAuthResult.refresh_token) {
            throw new Error("No refresh token found on cached auth result. Cannot perform silent auth.");
        }

        return await this.acquireAccessTokenViaRefreshToken(cachedAuthResult.refresh_token);
    }

    async acquireAccessTokenViaRefreshToken(refreshToken: string): Promise<IAuthResult> {
        console.log("running acquireAccessTokenViaRefreshToken");

        // TODO: Add logic to validate that token is for bb service scope and that audience is my client id.
        //  and if it isn't, fetch a token explicitly for it's scope.
        const resp = await this._httpClient.postAccessTokenRequestToService(refreshToken);
        if (!resp.ok) {
            throw new Error("Access token fetch request failed.");
        }

        const oauthResp: IOAuthResponse = await resp.json();
        const access_token_expiration = new Date();
        // Note: Padding the expiration by 5 minutes. Typically it's 1 hour expiration
        access_token_expiration.setSeconds(access_token_expiration.getSeconds() + oauthResp.expires_in - 300);
        const myResponse: IAuthResult = {
            //bbUserId: "tbd", //tid+oid claims in the token
            ...oauthResp,
            access_token_expiration,
            name: "tbd" // TODO: parse the access_token or id_token and acquire the name property.
        };

        this._browserFacade.setCachedAuthResult(myResponse);
        return myResponse;
    }
}