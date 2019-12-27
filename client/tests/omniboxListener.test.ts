import { mock, instance, verify, anyFunction, capture, when, objectContaining, anything, anyString } from 'ts-mockito';

import { IBookmarkManager } from '../src/bookmarkManager';
import { ISyncService } from '../src/syncService';
import { BrowserFacade } from '../src/browserFacades/browserFacade';
import { OmniboxListener } from '../src/omniboxListener';
import { Bookmark } from '../src/models/bookmark';

describe("omniboxListener -", () => {
    const theBookmark = new Bookmark("bbcode", "https://github.com");

    let mockedBrowser: BrowserFacade;
    let mockedBookmarkManager: IBookmarkManager;
    let mockedSyncService: ISyncService;

    let browser: BrowserFacade;
    let bookmarkManager: IBookmarkManager;
    let syncService: ISyncService;

    beforeEach(() => {
        mockedBrowser = mock<BrowserFacade>();
        mockedBookmarkManager = mock<IBookmarkManager>();
        mockedSyncService = mock<ISyncService>();        
    });

    describe("addOmniboxListeners -", () => {
        it("adds omnibox input changed and entered listeners on the browser", () => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();
            
            verify(mockedBrowser.addOmniboxInputChangedListener(anyFunction())).once();
            verify(mockedBrowser.addOmniboxInputEnteredListener(anyFunction())).once();
        });
    });

    describe("input entered listener", () => {
        it("navigates the current tab when a bookmark key is entered", (done) => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();

            when(mockedBookmarkManager.getBookmark("bbcode")).thenResolve(theBookmark);

            // capture the input entered handler
            const [inputEnteredHandler] = capture(mockedBrowser.addOmniboxInputEnteredListener).last();
            inputEnteredHandler("bbcode", "currentTab");

            setTimeout(() => {
                // needs to be inside a timeout to allow the promise(s) to resolve
                verify(mockedBrowser.navigateCurrentTab(theBookmark.url)).once();
                done();
            });
        });

        it("saves current url with provided key for sv command", (done) => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();

            const testUrl = "https://the.currenturl.com";
            when(mockedBrowser.getCurrentTabUrl()).thenResolve(testUrl);
            when(mockedBookmarkManager.saveBookmark(objectContaining({key: "testkey", url: testUrl }))).thenResolve();

            // capture the input entered handler
            const [inputEnteredHandler] = capture(mockedBrowser.addOmniboxInputEnteredListener).last();
            inputEnteredHandler("sv testkey", "currentTab");

            setTimeout(() => {
                // needs to be inside a timeout to allow the promise(s) to resolve
                verify(mockedBookmarkManager.saveBookmark(objectContaining({key: "testkey", url: testUrl }))).once();
                done();
            });
        });

        it("saves provided url with provided key for complex sv command", (done) => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();

            const testUrl = "https://the.providedurl.com";
            when(mockedBrowser.getCurrentTabUrl()).thenResolve("https://some.url.com");
            when(mockedBookmarkManager.saveBookmark(objectContaining({key: "testkey", url: testUrl }))).thenResolve();

            // capture the input entered handler
            const [inputEnteredHandler] = capture(mockedBrowser.addOmniboxInputEnteredListener).last();
            inputEnteredHandler(`sv testkey ${testUrl}`, "currentTab");

            setTimeout(() => {
                // needs to be inside a timeout to allow the promise(s) to resolve
                verify(mockedBookmarkManager.saveBookmark(objectContaining({key: "testkey", url: testUrl }))).once();
                done();
            });
        });

        it("posts browser notification after saving bookmark", (done) => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();

            const testUrl = "https://the.currenturl.com";
            when(mockedBrowser.getCurrentTabUrl()).thenResolve(testUrl);
            when(mockedBookmarkManager.saveBookmark(anything())).thenResolve();

            // capture the input entered handler
            const [inputEnteredHandler] = capture(mockedBrowser.addOmniboxInputEnteredListener).last();
            inputEnteredHandler("sv testkey", "currentTab");

            setTimeout(() => {
                // needs to be inside a timeout to allow the promise(s) to resolve
                verify(mockedBrowser.postNotification(anyString(), anyString())).once();
                done();
            });
        });

        it("syncs bookmarks after save", (done) => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();

            const testUrl = "https://the.currenturl.com";
            const testBookmarks = [new Bookmark("testkey", testUrl)];
            when(mockedBrowser.getCurrentTabUrl()).thenResolve(testUrl);
            when(mockedBookmarkManager.saveBookmark(anything())).thenResolve();
            when(mockedBookmarkManager.getBookmarks()).thenResolve(testBookmarks);

            // capture the input entered handler
            const [inputEnteredHandler] = capture(mockedBrowser.addOmniboxInputEnteredListener).last();
            inputEnteredHandler("sv testkey", "currentTab");

            setTimeout(() => {
                // needs to be inside a timeout to allow the promise(s) to resolve
                verify(mockedSyncService.synchronizeWithService(testBookmarks)).once();
                done();
            });
        });
    });

    function getOmniboxListenerWithMocks() {
        browser = instance(mockedBrowser);
        bookmarkManager = instance(mockedBookmarkManager);
        syncService = instance(mockedSyncService);

        return new OmniboxListener(browser, bookmarkManager, syncService);
    }    
});
