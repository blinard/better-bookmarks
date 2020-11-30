import { injectable, inject, interfaces } from "inversify";
import "reflect-metadata";
import TYPES from "../dependencyInjection/types";
import { IPKCEChallengeProvider, IPKCEVerifierProvider, PKCEChallengeMethod } from "./pkceChallengeAndVerifier";

export enum ResponseMode {
    Query = "query",
    Fragment = "fragment",
    FormPost = "form_post"
}

export enum PromptSetting {
    Login = "login",
    None = "none",
    Consent = "consent",
    SelectAccount = "select_account"
}

/*
// Line breaks for legibility only

POST /{tenant}/oauth2/v2.0/token HTTP/1.1
Host: https://login.microsoftonline.com
Content-Type: application/x-www-form-urlencoded

client_id=6731de76-14a6-49ae-97bc-6eba6914391e
&scope=https%3A%2F%2Fgraph.microsoft.com%2Fmail.read
&code=OAAABAAAAiL9Kn2Z27UubvWFPbm0gLWQJVzCTE9UkP3pSx1aXxUjq3n8b2JRLk4OxVXr...
&redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F
&grant_type=authorization_code
&code_verifier=ThisIsntRandomButItNeedsToBe43CharactersLong 
&client_secret=JqQX2PNo9bpM0uEihUPzyrh    // NOTE: Only required for web apps. This secret needs to be URL-Encoded.
*/

// Will also need to handle case where refresh_token is expired....should try to renew/re-login through iframe silently first.

export enum GrantType {
    AuthorizationCode = "authorization_code",
    RefreshToken = "refresh_token"
}

export interface IMSAAuthHelper {
    getAuthorizeRequestUrl(
        clientId: string, 
        redirectUri: string, 
        responseMode: ResponseMode, 
        scopes: Array<string>, 
        state: string,
        pkceChallengeProvider: IPKCEChallengeProvider,
        promptSetting: PromptSetting,
        loginHint: string,
        domainHint: string): Promise<string>
    
    getTokenRequestUrlUsingAuthCode(
        clientId: string,
        redirectUri: string,
        scopes: Array<string>,
        authCode: string,
        pkceVerifierProvider?: IPKCEVerifierProvider,
    ): TokenRequestInfo;

    getTokenRequestUrlUsingRefreshToken(
        clientId: string,
        redirectUri: string,
        scopes: Array<string>,
        refreshToken: string
    ): TokenRequestInfo;
}

export interface IStringKeyValuePairObject {
    [key: string]: string
}

export interface IQueryStringBuilder {
    buildQueryStringParams(qsKeysAndValues: IStringKeyValuePairObject): string
}

@injectable()
export class QueryStringBuilder implements IQueryStringBuilder {

    buildQueryStringParams(qsKeysAndValues: IStringKeyValuePairObject): string {
        let result = "";
        Object.keys(qsKeysAndValues).forEach((key) => {
            result += `${key.trim()}=${qsKeysAndValues[key].trim()}&`
        });

        return !result ? result : result.substring(0, result.length - 1);
    }
}

export interface IScopeQueryStringFormatter {
    formatScopesForQueryString(scopes: Array<string>): string;
}

@injectable()
export class ScopeQueryStringFormatter implements IScopeQueryStringFormatter {
    formatScopesForQueryString(scopes: Array<string>): string {
        let result = "";
        scopes.forEach((scope) => { result += scope.trim() + " "});
        result = result.trim();
        return encodeURIComponent(result);
    }
}

export interface TokenRequestInfo {
    url: string;
    fetchOptions: any;
}

@injectable()
export class MSAAuthHelper implements IMSAAuthHelper {

    constructor(
        @inject(TYPES.IQueryStringBuilder) private _queryStringBuilder: IQueryStringBuilder,
        @inject(TYPES.IScopeQueryStringFormatter) private _scopeQueryStringFormatter: IScopeQueryStringFormatter
    ) {

    }

    async getAuthorizeRequestUrl(
        clientId: string, 
        redirectUri: string, 
        responseMode: ResponseMode, 
        scopes: Array<string>, 
        state?: string,
        pkceChallengeProvider?: IPKCEChallengeProvider,
        promptSetting?: PromptSetting,
        loginHint?: string,
        domainHint?: string): Promise<string> {
 
        /*
        // Line breaks for legibility only

        https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize?
        client_id=6731de76-14a6-49ae-97bc-6eba6914391e
        &response_type=code
        &redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F
        &response_mode=query
        &scope=openid%20offline_access%20https%3A%2F%2Fgraph.microsoft.com%2Fmail.read
        &state=12345
        &code_challenge=YTFjNjI1OWYzMzA3MTI4ZDY2Njg5M2RkNmVjNDE5YmEyZGRhOGYyM2IzNjdmZWFhMTQ1ODg3NDcxY2Nl
        &code_challenge_method=S256
        */
        
        let params = {
            "client_id": clientId,
            "response_type": "code",
            "redirect_uri": redirectUri,
            "response_mode": responseMode,
        }

        const formattedScopes = this._scopeQueryStringFormatter.formatScopesForQueryString(scopes);
        if (formattedScopes) {
            params["scope"] = formattedScopes;
        }

        if (state) {
            params["state"] = state;
        }

        if (pkceChallengeProvider) {
            const challenge = await pkceChallengeProvider.getPKCEChallenge();
            if (challenge) {
                params["code_challenge"] = challenge.challenge
                params["code_challenge_method"] = challenge.challengeMethod
            }
        }

        if (promptSetting) {
            params["prompt"] = promptSetting;
        }

        if (loginHint) {
            params["login_hint"] = loginHint;
        }

        if (domainHint) {
            params["domain_hint"] = domainHint;
        }

        const queryString = this._queryStringBuilder.buildQueryStringParams(params);
        return "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?" + queryString;
    }

    getTokenRequestUrlUsingAuthCode(
        clientId: string,
        redirectUri: string,
        scopes: Array<string>,
        authCode: string,
        pkceVerifierProvider?: IPKCEVerifierProvider,
    ): TokenRequestInfo {

        /*
        // Line breaks for legibility only

        POST /{tenant}/oauth2/v2.0/token HTTP/1.1
        Host: https://login.microsoftonline.com
        Content-Type: application/x-www-form-urlencoded

        client_id=6731de76-14a6-49ae-97bc-6eba6914391e
        &scope=https%3A%2F%2Fgraph.microsoft.com%2Fmail.read
        &code=OAAABAAAAiL9Kn2Z27UubvWFPbm0gLWQJVzCTE9UkP3pSx1aXxUjq3n8b2JRLk4OxVXr...
        &redirect_uri=http%3A%2F%2Flocalhost%2Fmyapp%2F
        &grant_type=authorization_code
        &code_verifier=ThisIsntRandomButItNeedsToBe43CharactersLong 
        &client_secret=JqQX2PNo9bpM0uEihUPzyrh    // NOTE: Only required for web apps. This secret needs to be URL-Encoded.
        */
    
        const params = {
            "client_id": clientId,
            "redirect_uri": redirectUri,
            "grant_type": GrantType.AuthorizationCode,
            "code": authCode
        };

        const formattedScopes = this._scopeQueryStringFormatter.formatScopesForQueryString(scopes);
        if (formattedScopes) {
            params["scope"] = formattedScopes;
        }

        if (pkceVerifierProvider) {
            const verifier = pkceVerifierProvider.getPKCEVerifier();
            if (verifier) {
                params["code_verifier"] = verifier;
            }
        }

        const tokenRequestInfo = {
            url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            fetchOptions: {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                  'Content-Type': 'application/json'
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(params) // body data type must match "Content-Type" header
            } 
        }
        return tokenRequestInfo;
    }

    getTokenRequestUrlUsingRefreshToken(
        clientId: string,
        redirectUri: string,
        scopes: Array<string>,
        refreshToken: string
    ): TokenRequestInfo {

        /*

        // Line breaks for legibility only

        POST /{tenant}/oauth2/v2.0/token HTTP/1.1
        Host: https://login.microsoftonline.com
        Content-Type: application/x-www-form-urlencoded

        client_id=6731de76-14a6-49ae-97bc-6eba6914391e
        &scope=https%3A%2F%2Fgraph.microsoft.com%2Fmail.read
        &refresh_token=OAAABAAAAiL9Kn2Z27UubvWFPbm0gLWQJVzCTE9UkP3pSx1aXxUjq...
        &grant_type=refresh_token
        &client_secret=JqQX2PNo9bpM0uEihUPzyrh      // NOTE: Only required for web apps. This secret needs to be URL-Encoded

        */
        
        const params = {
            "client_id": clientId,
            "redirect_uri": redirectUri,
            "grant_type": GrantType.RefreshToken,
            "refresh_token": refreshToken
        };

        const formattedScopes = this._scopeQueryStringFormatter.formatScopesForQueryString(scopes);
        if (formattedScopes) {
            params["scope"] = formattedScopes;
        }

        const tokenRequestInfo = {
            url: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
            fetchOptions: {
                method: 'POST', // *GET, POST, PUT, DELETE, etc.
                headers: {
                  'Content-Type': 'application/json'
                  // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify(params) // body data type must match "Content-Type" header
            } 
        }
        return tokenRequestInfo;
   }

}