/// <reference types="jasmine" />

import { Base64Encode } from "../../src/authentication/base64Encode";
import { BrowserStringUtils } from "../../src/authentication/browserStringUtils";
import { PKCEChallengeAndVerifierFactory } from "../../src/authentication/pkceImplementation"

describe("PKCEChallengeAndVerifierFactory -", () => {
    const browserStringUtils = new BrowserStringUtils();
    const base64Encode = new Base64Encode(browserStringUtils);
    const pkceChallengeAndVerifierFactory = new PKCEChallengeAndVerifierFactory(base64Encode, browserStringUtils);

    describe("getPKCEVerifier -", () => {
        it("is idempotent / supports object immutibility", (done) => {
            let result1 = pkceChallengeAndVerifierFactory.getPKCEVerifier();
            let result2 = pkceChallengeAndVerifierFactory.getPKCEVerifier();
            expect(result2).toBe(result1);
            done();
        });
    });

    describe("getPKCEChallenge -", () => {
        it("is idempotent / supports object immutibility", async (done) => {
            let result1 = await pkceChallengeAndVerifierFactory.getPKCEChallenge()
            let result2 = await pkceChallengeAndVerifierFactory.getPKCEChallenge();
            
            expect(result2.challenge).toBe(result1.challenge);
            expect(result2.challengeMethod).toBe(result1.challengeMethod);
            done();
        });
    });
});

