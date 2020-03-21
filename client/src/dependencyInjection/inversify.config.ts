import { Container, interfaces } from "inversify";
import TYPES from "./types";
import "reflect-metadata";

import { BrowserFacade } from "../browserFacades/browserFacade";
import { ChromeBrowser } from "../browserFacades/chromeBrowser";
import { IBookmarkManager, BookmarkManager } from "../bookmarkManager";
import { ISyncService, SyncService } from "../syncService";
import { ISyncListener } from "../syncListener";
import { SyncListener } from "../syncListener";
import { IOptionsListener, OptionsListener } from "../optionsListener";
import { IOmniboxListener, OmniboxListener } from "../omniboxListener";
import Auth0Chrome from "auth0-chrome";
import { authConfig } from "../auth.config";
import { IAuthListener, AuthListener } from "../authListener";

var container = new Container();

container.bind<BrowserFacade>(TYPES.BrowserFacade).to(ChromeBrowser);
container.bind<IBookmarkManager>(TYPES.IBookmarkManager).to(BookmarkManager);
container.bind<ISyncService>(TYPES.ISyncService).to(SyncService);

container.bind<ISyncListener>(TYPES.ISyncListener).to(SyncListener);
container.bind<IOptionsListener>(TYPES.IOptionsListener).to(OptionsListener);
container.bind<IOmniboxListener>(TYPES.IOmniboxListener).to(OmniboxListener);
container.bind<IAuthListener>(TYPES.IAuthListener).to(AuthListener);

container.bind<interfaces.Factory<Auth0Chrome>>(TYPES.Auth0ChromeFactory).toFactory<Auth0Chrome>((context: interfaces.Context) => {
    return () => {
        return new Auth0Chrome(authConfig.AUTH0_DOMAIN, authConfig.AUTH0_CLIENT_ID);
    }
});

export default container;