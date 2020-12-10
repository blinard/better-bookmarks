import { inject, injectable } from "inversify";
import { BrowserFacade } from "../browserFacades/browserFacade";
import TYPES from "../dependencyInjection/types";
import { IMSAAuthHelper, ResponseMode, IOAuthResponse } from "./msaAuthHelper";
import { IPKCEChallengeAndVerifierFactory, IPKCEVerifierProvider } from "./pkceChallengeAndVerifier";

export interface IAuthManager {
    loginInteractive(): Promise<IAuthResult>;
    acquireToken(): Promise<IAuthResult>;
}

export interface IAuthResult {
    access_token: string
    id_token: string
    refresh_token: string
    scope: string
    token_type: string
    access_token_expiration: Date
    access_token_expiration_val?: number
    refresh_token_expiration: Date
    refresh_token_expiration_val?: number
    name: string
}

@injectable()
export class AuthManager implements IAuthManager {

    constructor(
        @inject(TYPES.IMSAAuthHelper) private _msaAuthHelper: IMSAAuthHelper,
        @inject(TYPES.IPKCEChallengeAndVerifierFactory) private _pkceChallengeAndVerifierFactory: IPKCEChallengeAndVerifierFactory,
        @inject(TYPES.BrowserFacade) private _browserFacade: BrowserFacade
    ) {}

    /*
        Chrome Extension auth as Mobile app Overall process:

        1. Extension does post to bbfunction (sending state key and bits for pkce verifier)
        2. Extension creates authorize url (with auth code and uses redirect_uri of https://bbfunction.azurewebsites.net/api/auth), opens new tab and navigates to authorize url
        3. User auths, auth flow redirects to https://bbfunction.azurewebsites.net/api/auth
        4. Function accepts state and code, looks up code verifier by state key, issues request for access and refresh token, receives tokens, provides them in the html response.
        5. Extension acquires tokens (function could poll for the token response but, better yet, the response page could trigger something in the extension to let it know the token is available.)
        6. Extension uses tokens, including refresh_token. 
    */

    async loginInteractive(): Promise<IAuthResult> {
        const urlBase = "https://df306839473c.ngrok.io"
        // Implementation based on: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
        const pkceChallengeAndVerfier = this._pkceChallengeAndVerifierFactory.getNewPKCEChallengeAndVerifier();
        const msaAuthorityScopes = ["openid", "profile", "offline_access"];
        const betterBookmarksScopes = ["api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"]; // TODO: Move this to a config
        const allScopes = [...msaAuthorityScopes, ...betterBookmarksScopes];
        const clientId = "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b"; // TODO: Move this to a config
        const redirectUri = urlBase + "/api/Authenticate" //chrome.identity.getRedirectURL('browserAction/browserAction.html'); // TODO: Move this to browserFacade

        // Section: Stores verifier
        // TODO: Generate a state key instead of hard-coding one.
        const stateKey = "111112"
        const verifierContent = {
            id: stateKey,
            StateKey: stateKey,
            VerifierCode: pkceChallengeAndVerfier.getPKCEVerifier()
        };

        let storageResp = await fetch(urlBase + "/api/StorePkceVerifier", {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json'
              // 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
            },
            body: JSON.stringify(verifierContent) // body data type must match "Content-Type" header
        });

        if (!storageResp.ok) {
            throw new Error("StorePkceVerifier call failed");
        }

        // Section: Begins auth with Authorize call (that is redirected to service).
        const authorizeUrl = await this._msaAuthHelper.getAuthorizeRequestUrl(
            clientId, redirectUri, ResponseMode.Query, allScopes, stateKey, pkceChallengeAndVerfier); // TODO: Do I need state?

        console.log("authorizeUrl: " + authorizeUrl);

        // const redirectResponseUrlAwaiter = new Promise<string>((resolve, reject) => {
        //     chrome.identity.launchWebAuthFlow({ url: authorizeUrl, interactive: true }, async (redirectResponseUrl) => { resolve(redirectResponseUrl); });
        // });

        chrome.tabs.create({ url: authorizeUrl });

        // Section: Now I'm done until the service sends me a response event via a contentScript integration in the response


        // const redirectResponseUrl = await redirectResponseUrlAwaiter;
        // if (!redirectResponseUrl) {
        //     throw new Error("redirectResponseUrl is empty, null or undefined.");
        // }

        // console.log("redirectUrl: " + redirectResponseUrl);
        // const responseValues = this.parseAuthorizeRedirectResponseUrl(redirectResponseUrl);
        // const myResponse = await this.acquireAccessTokenViaAuthCode(responseValues.code, clientId, redirectUri, msaAuthorityScopes, pkceChallengeAndVerfier);
        // // TODO: Set browser action icon to enabled ux.
        
        // return myResponse;
    }

    async acquireToken(): Promise<IAuthResult> {
        console.log("Attempting to acquire token...");
        // Fetch most recent full response token from cache.
        // If it doesn't exist, do the full silent auth flow (if that fails, admit defeat and display the signed out ux)
        const cachedAuthResult = await this._browserFacade.getCachedAuthResult();
        if (!cachedAuthResult) {
            return this.loginSilent();
        }

        // If it's not expired, return it
        console.log("cachedAuthResponse is:");
        console.log(cachedAuthResult);
        const now = new Date();
        if (now <= cachedAuthResult.access_token_expiration && cachedAuthResult.access_token) {
            console.log("Cached token is good, returning cached token");
            return cachedAuthResult
        }

        // Cached access_token is expired. Try refreshing it.
        // If the refresh token is not expired 2 minutes from now, perform an access token fetch by refresh token (if that fails do a full silent auth flow, if that fails defeat)
        if (now <= cachedAuthResult.refresh_token_expiration && cachedAuthResult.refresh_token) {
            try {
                return await this.acquireAccessTokenViaRefreshToken(cachedAuthResult.refresh_token);
            }
            catch(e) {
                console.log("acquireAccessTokenViaRefreshToken failed");
                console.error(e);
                return await this.loginSilent();
            }
        }
        
        // Perform a full silent auth flow (if it fails, admit defeat
        return await this.loginSilent();
    }

    async loginSilent(): Promise<IAuthResult> {
        console.log("Running loginSilent");
        // Implementation based on: https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-auth-code-flow
        const pkceChallengeAndVerfier = this._pkceChallengeAndVerifierFactory.getNewPKCEChallengeAndVerifier();
        const msaAuthorityScopes = ["openid", "profile", "offline_access"];
        const betterBookmarksScopes = ["api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"]; // TODO: Move this to a config
        const allScopes = [...msaAuthorityScopes, ...betterBookmarksScopes];
        const clientId = "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b"; // TODO: Move this to a config
        const redirectUri = chrome.identity.getRedirectURL('browserAction/browserAction.html'); // TODO: Move this to browserFacade

        const authorizeUrl = await this._msaAuthHelper.getAuthorizeRequestUrl(
            clientId, redirectUri, ResponseMode.Fragment, allScopes, "54321", pkceChallengeAndVerfier); // TODO: Do I need state?

        console.log("authorizeUrl: " + authorizeUrl);

        const redirectResponseUrlAwaiter = new Promise<string>((resolve, reject) => {
            chrome.identity.launchWebAuthFlow({ url: authorizeUrl, interactive: false }, async (redirectResponseUrl) => { resolve(redirectResponseUrl); });
        });

        // TODO: Get clarity on what an error looks like here and handle it.
        const redirectResponseUrl = await redirectResponseUrlAwaiter;
        if (!redirectResponseUrl) {
            // If failure, update the browserAction icon to disabled.
            throw new Error("redirectResponseUrl is empty, null or undefined.");
        }

        console.log("redirectUrl: " + redirectResponseUrl);
        const responseValues = this.parseAuthorizeRedirectResponseUrl(redirectResponseUrl);
        const myResponse = await this.acquireAccessTokenViaAuthCode(responseValues.code, clientId, redirectUri, msaAuthorityScopes, pkceChallengeAndVerfier);
        // TODO: Set browser action icon to enabled ux.
        
        return myResponse;
    }

    // TODO: Add a type for this guy
    parseAuthorizeRedirectResponseUrl(redirectResponseUrl: string): any {
        const hash = redirectResponseUrl.substring(redirectResponseUrl.indexOf("#") + 1);
        console.log("hash: " + hash);
        const responseValues: any = {};
        hash.split("&").forEach((kvp) => {
            const keyThenValueArray = kvp.split("=");
            responseValues[keyThenValueArray[0]] = keyThenValueArray[1];
        });

        return responseValues;
    }

    async acquireAccessTokenViaAuthCode(authCode: string, clientId: string, redirectUri: string, scopes: Array<string>, pkceVerifierProvider?: IPKCEVerifierProvider): Promise<IAuthResult> {
        const tokenRequestInfo = this._msaAuthHelper.getTokenRequestUrlUsingAuthCode(clientId, redirectUri, scopes, authCode, pkceVerifierProvider);
        
        // TODO: Add logic to validate that token is for bb service scope and that audience is my client id.
        //  and if it isn't, fetch a token explicitly for it's scope.
        const resp = await fetch(tokenRequestInfo.url, tokenRequestInfo.fetchOptions);
        console.log(tokenRequestInfo);
        console.log(resp)
        if (!resp.ok) {
            throw new Error("Access token fetch request failed.");
        }

        const oauthResp: IOAuthResponse = await resp.json();
        console.log("token below:");
        console.log(oauthResp);

        const access_token_expiration = new Date();
        // Note: Padding the expiration by 5 minutes. Typically it's 1 hour expiration
        access_token_expiration.setSeconds(access_token_expiration.getSeconds() + oauthResp.expires_in - 300);
        const refresh_token_expiration = new Date();
        // Note: Typically refresh tokens are valid for 24 hrs. Padding the expiration by 2 hrs.
        // Note: It'd be nice to be able to get a concrete expiry time on this.
        refresh_token_expiration.setHours(refresh_token_expiration.getHours() + 22);
        const myResponse: IAuthResult = {
            //bbUserId: "tbd", //tid+oid claims in the token
            ...oauthResp,
            access_token_expiration,
            refresh_token_expiration,
            name: "tbd" // TODO: parse the access_token or id_token and acquire the name property.
        };

        console.log("myResponse");
        console.log(myResponse);
        this._browserFacade.setCachedAuthResult(myResponse);
        return myResponse;
    }
    
    async acquireAccessTokenViaRefreshToken(refreshToken: string): Promise<IAuthResult> {
        console.log("running acquireAccessTokenViaRefreshToken");
        const betterBookmarksScopes = ["api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"]; // TODO: Move this to a config
        const clientId = "ab8d1625-d6be-4548-ab9f-0a0c0f958d6b"; // TODO: Move this to a config
        const redirectUri = chrome.identity.getRedirectURL('browserAction/browserAction.html'); // TODO: Move this to browserFacade

        const tokenRequestInfo = this._msaAuthHelper.getTokenRequestUrlUsingRefreshToken(clientId, redirectUri, betterBookmarksScopes, refreshToken);
        
        // TODO: Add logic to validate that token is for bb service scope and that audience is my client id.
        //  and if it isn't, fetch a token explicitly for it's scope.
        const resp = await fetch(tokenRequestInfo.url, tokenRequestInfo.fetchOptions);
        console.log(tokenRequestInfo);
        console.log(resp)
        if (!resp.ok) {
            throw new Error("Access token fetch request failed.");
        }

        // id_token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjFMVE16YWtpaGlSbGFfOHoyQkVKVlhlV01xbyJ9.eyJ2ZXIiOiIyLjAiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vOTE4ODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkL3YyLjAiLCJzdWIiOiJBQUFBQUFBQUFBQUFBQUFBQUFBQUFNUGtldEs3SkVGTTVkazE3YWVwWExFIiwiYXVkIjoiYWI4ZDE2MjUtZDZiZS00NTQ4LWFiOWYtMGEwYzBmOTU4ZDZiIiwiZXhwIjoxNjA3MjI2MjQ5LCJpYXQiOjE2MDcxMzk1NDksIm5iZiI6MTYwNzEzOTU0OSwibmFtZSI6IkJyYWQgTGluYXJkIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYnJhZC5saW5hcmRAb3V0bG9vay5jb20iLCJvaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtNGQwZC1iMzBhYzk5OWQ3OGEiLCJ0aWQiOiI5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJhaW8iOiJEYkVpU0F3QUNvUlVXRCppcXdva09PdGpiTDhOU1NreXJaUHZObTNyZG9TM2hFRkFVS2k1aFVFZGxOYlFqaFpjTEZHeCEyNzhjSWpOQzQ1YWY5d0ZUSzFzVVVpUzhQdGtPY2FxdHJwb2k2NEhQWUJja3RpTDVxZ3FKYlRaOEVDc3BGZ0F5czRYZWdDbm9KU3JWVFBKTThrJCJ9.yMIobYsWimbA-P_Zku1CROvYneREiRQk9Ys4ew-nD2ucPPm13MuRaAXMlEFsMcBLji6MlGfGb_0Fhrly8v-q_RxS0MGjauOD9ByVNWg5FU0S_5lhQr_ailvqlpLOm0vjiNWGxP8_My_Xljbfa2AM-L8LSNvRSfrQpllCclof5FqBdT-6D5Kd98LRfry21Av6_T6U6ZHhCnZ7ARAW2WdG2xSSryC8dPd5ZgyolS3k64oSEFcVlpzvyZcCow3Rrx51YBe3IOtBE7_zXb0qvsc4ayFBw-2Tz8pkHovNS1BIfmvy1F6966ZVAWrvIluvG6KsVUloG38wM0Uefz1c5G2evg

        // access_token: eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6IjFMVE16YWtpaGlSbGFfOHoyQkVKVlhlV01xbyJ9.eyJ2ZXIiOiIyLjAiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vOTE4ODA0MGQtNmM2Ny00YzViLWIxMTItMzZhMzA0YjY2ZGFkL3YyLjAiLCJzdWIiOiJBQUFBQUFBQUFBQUFBQUFBQUFBQUFQRmR4bFVqcVQ4VDZGclVsYUhTdjY0IiwiYXVkIjoiZWQxNzZjM2MtM2VlNC00ZjBkLTkxOWQtNmZmMWU0Zjc5MmFhIiwiZXhwIjoxNjA3MTQzNDQ5LCJpYXQiOjE2MDcxMzk1NDksIm5iZiI6MTYwNzEzOTU0OSwibmFtZSI6IkJyYWQgTGluYXJkIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYnJhZC5saW5hcmRAb3V0bG9vay5jb20iLCJvaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtNGQwZC1iMzBhYzk5OWQ3OGEiLCJ0aWQiOiI5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJhenAiOiJhYjhkMTYyNS1kNmJlLTQ1NDgtYWI5Zi0wYTBjMGY5NThkNmIiLCJzY3AiOiJCb29rbWFya3MuU3luYyIsImF6cGFjciI6IjAiLCJhaW8iOiJEWEJJWTg0dFJGbDFZbWRZYVZRRHRRZ1diY0NqVTkxSXREQlBUbXZ5IVZaQmU5WW1DeEhOSEZuWlR4dWR1RUJ4UHBoOWptTEpldTFLaXoxRzFEVXBiMUFDbVlBdHAqa1BrUjBwTG5hS0lLNGEqV0tkcnFrNXU2OXFudzJMaDlPVWpsS2FOaldWOHRqQjhPcmlKOVpCd1U0JCJ9.07z2YUBOK4mQvaD9OBl2UapLfu1gcun4QGZRFij92Q9WyxOhuxRnHO9h25j0wYECJnKGjfTAJjVAMQ6mzeJjmX_eMK-lxOVBxXGTzoDKu8gNYQtTi5CvonPj2NoSZg6UxBeWd1NdfTo6fkZznR4XOB8r-I2rWZbYbo2ew8B2kkSDlDezF1L0TrJtRgF88OXjCw2CcqFBrIPi91PDTaY9Eu36OuuONZOQ3HxKgEQU0mUeZecOatccT-UQOsFAklqW1CGw9EdxVyhK4tfbAKFucVipFHZJcj-zJ7wcGlcaqFeDySs1YHwRDLtU6wpwmdzReTgNTaQnGURNmqsYOiINbg

        // refresh_token: M.R3_BL2.CUpgdYlaNhC1Dbv1MjRqvH6ZDI*R0hBNo0xZANtRy6H10sHf!6iRjMSzRwAi8P3zkokxovyNGZk0ir2QjKE9PnuPo!RdiPK7SiEEBQMpPL5r9x*N9daehX0z7EISnhZCFzAzXWCCHzPUOmsF6kuXGmK*aXj8oQbk7PLOFIaxeuvAyS88wF4ZG0yu*ewmOr78KxzcNuR2Ii3NKS!oAB4s4JpaAfeqYi*mk8FL8tssNhyQ!i8hw!S7r4vRTVtwWm01QDN9eCX1p*MN26e9wCsElkiqKJknTxPWF6wXvFKHkCHZlpic6mi1TgyG8l3EHNa4mQbK*xAcqL4qhK8jdnB8T3aQju9L37M*soKXgQA7LoFwZgRGI7RUDS*lxKwiH2m!U0NG3Rxmc7c6M42nnmGy1D*AqSMJAly0QBj7pcfLDx!vqdkig2ozgFNNZVE0HlASXqoMwIkbBv5B3hLZY*pls4IwdFdm7n!sIY7x5O4G3qZVGoxQmcdOU7uhSwZHTHDTPmRX*cb2xsb6JKJyI0aQgZAXnxtVzY!eRTDmD0!VHiom

        const oauthResp: IOAuthResponse = await resp.json();
        console.log("token below:");
        console.log(oauthResp);

        const access_token_expiration = new Date();
        // Note: Padding the expiration by 5 minutes. Typically it's 1 hour expiration
        access_token_expiration.setSeconds(access_token_expiration.getSeconds() + oauthResp.expires_in - 300);
        const refresh_token_expiration = new Date();
        // Note: Typically refresh tokens are valid for 24 hrs. Padding the expiration by 2 hrs.
        // Note: It'd be nice to be able to get a concrete expiry time on this.
        refresh_token_expiration.setHours(refresh_token_expiration.getHours() + 22);
        const myResponse: IAuthResult = {
            //bbUserId: "tbd", //tid+oid claims in the token
            ...oauthResp,
            access_token_expiration,
            refresh_token_expiration,
            name: "tbd" // TODO: parse the access_token or id_token and acquire the name property.
        };

        this._browserFacade.setCachedAuthResult(myResponse);
        return myResponse;
    }
}