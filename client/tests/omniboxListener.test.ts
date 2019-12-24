import { mock, instance, verify, anyFunction } from 'ts-mockito';

import { IBookmarkManager } from '../src/bookmarkManager';
import { Bookmark } from '../src/models/bookmark';
import { ISyncService } from '../src/syncService';
import { BrowserFacade } from '../src/browserFacades/browserFacade';
import { OmniboxListener } from '../src/omniboxListener';

import { ConstructorSpies } from "./testHelpers.test";

describe("omniboxListener -", () => {
    let browserMock: BrowserFacade;
    let bookmarkManagerMock: IBookmarkManager;
    let syncServiceMock: ISyncService;

    let fakeBrowser: BrowserFacade;
    let fakeBookmarkManager: IBookmarkManager;
    let fakeSyncService: ISyncService;

    let omniboxListener: OmniboxListener;

    beforeEach(() => {
        browserMock = mock<BrowserFacade>();
        bookmarkManagerMock = mock<IBookmarkManager>();
        syncServiceMock = mock<ISyncService>();        
    });

    describe("addOmniboxListeners -", () => {

        it("adds an omnibox input changed listener on the browser", () => {
            fakeBrowser = instance(browserMock);
            fakeBookmarkManager = instance(bookmarkManagerMock);
            fakeSyncService = instance(syncServiceMock);

            omniboxListener = new OmniboxListener(fakeBrowser, fakeBookmarkManager, fakeSyncService);
            omniboxListener.addOmniboxListeners();
            
            verify(browserMock.addOmniboxInputChangedListener(anyFunction())).once();
            verify(browserMock.addOmniboxInputEnteredListener(anyFunction())).once();
        });

        it("can save a bookmark", () => {
            let result = 5 + 2;
            expect(result).toBe(7);
        });

        // it("does not honor capitalization in bookmark keys", () => {
        // });

    });

});