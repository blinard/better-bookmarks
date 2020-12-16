import { inject, injectable } from "inversify";
import { IApplicationSettings } from "./applicationSettings";
import { IPKCEChallengeAndVerifier } from "./authentication/pkceChallengeAndVerifier";
import TYPES from "./dependencyInjection/types";

export interface IAuthState {
    StateKey: string;
    AuthCodeVerifier: string;
    ClientId: string;
    RedirectUrl: string;
    Scopes: string;
}

export interface IAuthStateFactory {
    getAuthState(stateKey: string, pkceChallengeAndVerifier: IPKCEChallengeAndVerifier): IAuthState;
}

@injectable()
export class AuthStateFactory implements IAuthStateFactory {

    constructor(
        @inject(TYPES.IApplicationSettings) private _appSettings: IApplicationSettings
    ) {}

    getAuthState(stateKey: string, pkceChallengeAndVerifier: IPKCEChallengeAndVerifier): IAuthState {
        return {
            StateKey: stateKey,
            AuthCodeVerifier: pkceChallengeAndVerifier.getPKCEVerifier(),
            ClientId: this._appSettings.Auth.ClientId,
            RedirectUrl: this._appSettings.Auth.RedirectUrl,
            Scopes: [...this._appSettings.Auth.BetterBookmarkScopes].join(" ")
        }
    }
}