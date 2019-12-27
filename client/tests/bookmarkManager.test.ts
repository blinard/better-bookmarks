import { BookmarkManager } from "../src/bookmarkManager";
import { BrowserFacade } from "../src/browserFacades/browserFacade";
import { mock, instance, when } from "ts-mockito";
import { Bookmark } from "../src/models/bookmark";

describe("bookmarkManager -", () => {
    const someBookmark = new Bookmark("someKey", "someUrl");
    const anotherBookmark = new Bookmark("anotherKey", "anotherUrl");
    const localBookmarkData = [someBookmark, anotherBookmark];
    let bookmarkManager: BookmarkManager;

    let mockedBrowser: BrowserFacade;
    let browser: BrowserFacade;

    beforeEach(() => {
        mockedBrowser = mock<BrowserFacade>();
        when(mockedBrowser.getLocalBookmarksData()).thenResolve(localBookmarkData);
        browser = instance(mockedBrowser);

        bookmarkManager = new BookmarkManager(browser);
    });

    describe("getBookmark -", () => {
        it("returns correct bookmark for provided bookmarkKey", (done) => {
            bookmarkManager.getBookmark(someBookmark.key)
                .then((requestedBookmark) => {
                    expect(requestedBookmark).toBe(someBookmark);
                    done();
                });
        });

        it("returns undefined for invalid bookmarkKey", (done) => {
            bookmarkManager.getBookmark(undefined)
                .then((requestedBookmark) => {
                    expect(requestedBookmark).toBeUndefined();
                    done();
                })
                .catch((err) => {
                    done.fail(err);
                })
        });
    });

});