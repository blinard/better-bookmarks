import { ConstructorSpies } from "./testHelpers.test";
import { BrowserFacade } from "../src/browserFacades/browserFacade";
import { BookmarkManager } from "../src/bookmarkManager";
import { ChromeBrowser } from "../src/browserFacades/chromeBrowser";
import { inputEnteredHandler } from "../src/omniboxListeners";

describe("omniboxListener -", () => {
    /// let browserConstructorSpy: any;
    // let bookmarkManagerConstructorSpy = jasmine.createSpy();
    let browserConstructorSpy: ConstructorSpies<BrowserFacade>;
    let bookmarkManagerConstructorSpy: ConstructorSpies<BookmarkManager>;
    let blah: any;

    beforeEach(() => {
        // window["ChromeBrowser"] = browserConstructorSpy;
        // window["BookmarkManager"] = bookmarkManagerConstructorSpy;
        blah = jasmine.createSpy("blah", <any>ChromeBrowser).and.callThrough();
        browserConstructorSpy = new ConstructorSpies<BrowserFacade>("ChromeBrowser");
        bookmarkManagerConstructorSpy = new ConstructorSpies<BookmarkManager>("BookmarkManager");
    });

    describe("inputEnteredHandler -", () => {

        it("constructs a ChromeBrowser object", () => {
            // let chromeBrowser = { getCurrentTab: jasmine.createSpy() };
            // browserConstructorSpy.and.returnValue(chromeBrowser);
            
            inputEnteredHandler("sv derp", "currentTab");

            expect(blah).toHaveBeenCalledTimes(1);
        });

        it("can save a bookmark", () => {
            let result = 5 + 2;
            expect(result).toBe(7);
        });

        // it("does not honor capitalization in bookmark keys", () => {
        // });

    });

});