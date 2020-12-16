/// <reference types="jasmine" />

import { ScopeQueryStringFormatter } from "../../src/authentication/msaAuthHelper"

describe("ScopeQueryStringFormatter -", () => {
    const scopeQueryStringFormatter = new ScopeQueryStringFormatter();

    describe("formatScopesForQueryString -", () => {
        it("formats scopes for use in query string", () => {
            const result = scopeQueryStringFormatter.formatScopesForQueryString(["openid", "offline_access"]);
            expect(result).toBe("openid%20offline_access");
        });

        it("trims scopes", () => {
            const result = scopeQueryStringFormatter.formatScopesForQueryString(["openid ", " offline_access"]);
            expect(result).toBe("openid%20offline_access");
        });

        it("returns empty string for empty array", () => {
            const result = scopeQueryStringFormatter.formatScopesForQueryString([]);
            expect(result).toBe("");
        });
    });
});