
// Proof Key for Code Exchange (PKCE)

import { inject, injectable } from "inversify";
import TYPES from "../dependencyInjection/types";
import { IBase64Encode } from "./base64Encode";
import { IBrowserStringUtils } from "./browserStringUtils";

export enum PKCEChallengeMethod {
    S256 = "S256",
    Plain = "plain"
}

export interface IPKCEChallenge {
    challenge: string,
    challengeMethod: PKCEChallengeMethod
}

export interface IPKCEChallengeProvider {
    getPKCEChallenge(): Promise<IPKCEChallenge>
}

export interface IPKCEVerifierProvider {
    getPKCEVerifier(): string
}

injectable()
export class PKCEChallengeAndVerifierFactory implements IPKCEVerifierProvider, IPKCEChallengeProvider {
    private RANDOM_BYTE_ARR_LENGTH = 32;
    private S256_HASH_ALG = "SHA-256";
    private _cryptoObj = window.crypto;
    private _dataBuffer: Uint8Array;

    constructor(
        @inject(TYPES.IBase64Encode) private _base64Encode: IBase64Encode, 
        @inject(TYPES.IBrowserStringUtils) private _browserStringUtils: IBrowserStringUtils
        ) {
        this._dataBuffer = new Uint8Array(this.RANDOM_BYTE_ARR_LENGTH);
        this._cryptoObj.getRandomValues(this._dataBuffer);
    }

    getPKCEVerifier(): string {
        const pkceCodeVerifier = this._base64Encode.urlEncodeArr(this._dataBuffer);
        return pkceCodeVerifier;
    }
    
    async getPKCEChallenge(): Promise<IPKCEChallenge> {
        const pkceCodeVerifier = this.getPKCEVerifier();

        const data = this._browserStringUtils.stringToUtf8Arr(pkceCodeVerifier);
        const pkceHashedCodeVerifier = await window.crypto.subtle.digest(this.S256_HASH_ALG, data);
        let challenge = this._base64Encode.urlEncodeArr(new Uint8Array(pkceHashedCodeVerifier));
        return {
            challenge,
            challengeMethod: PKCEChallengeMethod.S256
        };
    }

}