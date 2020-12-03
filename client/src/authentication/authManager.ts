import { inject } from "inversify";
import TYPES from "../dependencyInjection/types";
import { IMSAAuthHelper, ResponseMode, IOAuthResponse } from "./msaAuthHelper";
import { IPKCEChallengeAndVerifierFactory } from "./pkceChallengeAndVerifier";

export interface IAuthManager {
    loginInteractive(): Promise<IAuthResponse>;
    acquireToken(): Promise<IAuthResponse>;
}

export interface IAuthResponse {
    bbUserId: string
    accessToken: string
}

export class AuthManager implements IAuthManager {

    constructor(
        @inject(TYPES.IMSAAuthHelper) private _msaAuthHelper: IMSAAuthHelper,
        @inject(TYPES.IPKCEChallengeAndVerifierFactory) private _pkceChallengeAndVerifierFactory: IPKCEChallengeAndVerifierFactory
    ) {}

    async loginInteractive(): Promise<IAuthResponse> {
        // Implementation based on: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
        const pkceChallengeAndVerfier = this._pkceChallengeAndVerifierFactory.getNewPKCEChallengeAndVerifier();
        const msaAuthorityScopes = ["openid", "profile", "offline_access"];
        const betterBookmarksScopes = ["api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"];
        const allScopes = [...msaAuthorityScopes, ...betterBookmarksScopes];
        const clientId = "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b"; // TODO: Move this to a config
        const redirectUri = chrome.identity.getRedirectURL('browserAction/browserAction.html'); // TODO: Move this to browserFacade

        const authorizeUrl = await this._msaAuthHelper.getAuthorizeRequestUrl(
            clientId, redirectUri, ResponseMode.Fragment, allScopes, "54321", pkceChallengeAndVerfier); // TODO: Do I need state?

        console.log("authorizeUrl: " + authorizeUrl);
        chrome.identity.launchWebAuthFlow({ url: authorizeUrl, interactive: true }, async (redirectResponseUrl) => {
            if (!redirectResponseUrl) {
                console.error("redirectUrl was empty, null or undefined");
                return;
            }

            console.log("redirectUrl: " + redirectResponseUrl);
            const hash = redirectResponseUrl.substring(redirectResponseUrl.indexOf("#") + 1);
            console.log("hash: " + hash);
            const responseValues: any = {};
            hash.split("&").forEach((kvp) => {
                const keyThenValueArray = kvp.split("=");
                responseValues[keyThenValueArray[0]] = keyThenValueArray[1];
            })

            const tokenRequestInfo = this._msaAuthHelper.getTokenRequestUrlUsingAuthCode(clientId, redirectUri, msaAuthorityScopes, responseValues.code, pkceChallengeAndVerfier);
            
            const resp = await fetch(tokenRequestInfo.url, tokenRequestInfo.fetchOptions);
            console.log(tokenRequestInfo);
            console.log(resp)
            if (!resp.ok) {
                console.error("Token request failed.")
                return;
            }

            const authResp: IOAuthResponse = await resp.json();
            console.log(authResp.access_token);
        });

        throw new Error("Not Implemented");
    }

    async acquireToken(): Promise<IAuthResponse> {
        throw new Error("Not Implemented");
    }
}