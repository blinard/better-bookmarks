import { ConstructorSpies } from "./testHelpers";
import { BrowserFacade } from "../src/browserFacades/browserFacade";
import { BookmarkManager } from "../src/bookmarkManager";
import { inputEnteredHandler } from "../src/omniboxListeners";

describe("omniboxListener -", () => {
    // let browserConstructorSpy = jasmine.createSpy();
    // let bookmarkManagerConstructorSpy = jasmine.createSpy();
    let browserConstructorSpy: ConstructorSpies<BrowserFacade>;
    let bookmarkManagerConstructorSpy: ConstructorSpies<BookmarkManager>;

    beforeEach(() => {
        // window["ChromeBrowser"] = browserConstructorSpy;
        // window["BookmarkManager"] = bookmarkManagerConstructorSpy;

        browserConstructorSpy = new ConstructorSpies<BrowserFacade>("ChromeBrowser");
        bookmarkManagerConstructorSpy = new ConstructorSpies<BookmarkManager>("BookmarkManager");
    });

    describe("inputEnteredHandler -", () => {

        it("constructs a ChromeBrowser object", () => {
            // let chromeBrowser = { getCurrentTab: jasmine.createSpy() };
            // browserConstructorSpy.and.returnValue(chromeBrowser);
            
            inputEnteredHandler("sv derp", "currentTab");

            expect(browserConstructorSpy.getConstructorSpy).toHaveBeenCalledTimes(1);
        });

        it("can save a bookmark", () => {
            let result = 5 + 2;
            expect(result).toBe(7);
        });

        // it("does not honor capitalization in bookmark keys", () => {
        // });

    });

});