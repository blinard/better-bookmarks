/// <reference types="jasmine" />

import { Base64Encode } from "../../src/authentication/base64Encode";
import { BrowserStringUtils } from "../../src/authentication/browserStringUtils";
import { PKCEChallengeAndVerifier, PKCEChallengAndVerifierFactory } from "../../src/authentication/pkceChallengeAndVerifier"

describe("PKCEChallengeAndVerifier -", () => {
    const browserStringUtils = new BrowserStringUtils();
    const base64Encode = new Base64Encode(browserStringUtils);
    const pkceChallengeAndVerifierFactory = new PKCEChallengAndVerifierFactory(base64Encode, browserStringUtils);
    const pkceChallengeAndVerifier = pkceChallengeAndVerifierFactory.getNewPKCEChallengeAndVerifier();

    describe("getPKCEVerifier -", () => {
        it("is idempotent", (done) => {
            let result1 = pkceChallengeAndVerifier.getPKCEVerifier();
            let result2 = pkceChallengeAndVerifier.getPKCEVerifier();
            expect(result2).toBe(result1);
            done();
        });
    });

    describe("getPKCEChallenge -", () => {
        it("is idempotent", async (done) => {
            let result1 = await pkceChallengeAndVerifier.getPKCEChallenge()
            let result2 = await pkceChallengeAndVerifier.getPKCEChallenge();
            
            expect(result2.challenge).toBe(result1.challenge);
            expect(result2.challengeMethod).toBe(result1.challengeMethod);
            done();
        });
    });
});

