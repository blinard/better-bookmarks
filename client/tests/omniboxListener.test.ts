import { mock, instance, verify, anyFunction, capture, when } from 'ts-mockito';

import { IBookmarkManager } from '../src/bookmarkManager';
import { ISyncService } from '../src/syncService';
import { BrowserFacade } from '../src/browserFacades/browserFacade';
import { OmniboxListener } from '../src/omniboxListener';
import { Bookmark } from '../src/models/bookmark';

describe("omniboxListener -", () => {
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
        it("navigates the current tab when a bookmark key is entered", () => {
            let omniboxListener = getOmniboxListenerWithMocks();
            omniboxListener.addOmniboxListeners();

            const resultBookmark = new Bookmark("bbcode", "https://github.com");
            when(mockedBookmarkManager.getBookmark("bbcode")).thenResolve(resultBookmark);

            // capture the input entered handler
            const [inputEnteredHandler] = capture(mockedBrowser.addOmniboxInputEnteredListener).last();
            inputEnteredHandler("bbcode", "currentTab");

            setTimeout(() => {
                verify(mockedBrowser.navigateCurrentTab(resultBookmark.url)).once();
            }, 100);
        });
    });

    function getOmniboxListenerWithMocks() {
        browser = instance(mockedBrowser);
        bookmarkManager = instance(mockedBookmarkManager);
        syncService = instance(mockedSyncService);

        return new OmniboxListener(browser, bookmarkManager, syncService);
    }    
});
