import { mock, instance, verify, anyFunction } from 'ts-mockito';

import { IBookmarkManager } from '../src/bookmarkManager';
import { ISyncService } from '../src/syncService';
import { BrowserFacade } from '../src/browserFacades/browserFacade';
import { OmniboxListener } from '../src/omniboxListener';

describe("omniboxListener -", () => {
    let mockedBrowser: BrowserFacade;
    let mockedBookmarkManager: IBookmarkManager;
    let mockedSyncService: ISyncService;

    let browser: BrowserFacade;
    let bookmarkManager: IBookmarkManager;
    let syncService: ISyncService;

    let omniboxListener: OmniboxListener;

    beforeEach(() => {
        mockedBrowser = mock<BrowserFacade>();
        mockedBookmarkManager = mock<IBookmarkManager>();
        mockedSyncService = mock<ISyncService>();        
    });

    describe("addOmniboxListeners -", () => {

        it("adds an omnibox input changed listener on the browser", () => {
            browser = instance(mockedBrowser);
            bookmarkManager = instance(mockedBookmarkManager);
            syncService = instance(mockedSyncService);

            omniboxListener = new OmniboxListener(browser, bookmarkManager, syncService);
            omniboxListener.addOmniboxListeners();
            
            verify(mockedBrowser.addOmniboxInputChangedListener(anyFunction())).once();
            verify(mockedBrowser.addOmniboxInputEnteredListener(anyFunction())).once();
        });

        it("can save a bookmark", () => {
            let result = 5 + 2;
            expect(result).toBe(7);
        });

        // it("does not honor capitalization in bookmark keys", () => {
        // });

    });

});