/// <reference types="jasmine" />

import { QueryStringBuilder } from "../../src/authentication/msaAuthHelper"

describe("QueryStringBuilder -", () => {
    const queryStringBuilder = new QueryStringBuilder();

    describe("buildQueryStringParams -", () => {
        it("builds query string params from object", () => {
            const result = queryStringBuilder.buildQueryStringParams({
                "param1": "value1",
                "param_2": "value_2",
                "p3": "v3"
            });

            expect(result).toBe("param1=value1&param_2=value_2&p3=v3");
        });

        it("trims query string keys and values", () => {
            const result = queryStringBuilder.buildQueryStringParams({
                "param1 ": "value1 ",
                "param_2": "value_2",
                "p3": "v3"
            });

            expect(result).toBe("param1=value1&param_2=value_2&p3=v3");
        });

        it("does not url encode query string values", () => {
            const result = queryStringBuilder.buildQueryStringParams({
                "param1": "value 1",
                "param_2": "value_2",
            });

            expect(result).toContain(" ");
        });

        it("does not url encode query string keys", () => {
            const result = queryStringBuilder.buildQueryStringParams({
                "param 1": "value1",
                "param_2": "value_2",
            });

            expect(result).toContain(" ");
        });
    });
});