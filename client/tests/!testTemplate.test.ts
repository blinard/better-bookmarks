/// <reference types="jasmine" />

import { SyncService} from "../src/syncService"

describe("SyncService -", () => {
    const syncService = new SyncService(null);

    describe("functionName -", () => {
        it("does something", (done) => {
            expect(1).toBe(1);
            done();
        });
    });
});
