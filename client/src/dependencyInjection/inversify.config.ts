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
import { IAuthListener, AuthListener } from "../authListener";
import { IMSAAuthHelper, IQueryStringBuilder, IScopeQueryStringFormatter, MSAAuthHelper, QueryStringBuilder, ScopeQueryStringFormatter } from "../authentication/msaAuthHelper";
import { Base64Encode, IBase64Encode } from "../authentication/base64Encode";
import { BrowserStringUtils, IBrowserStringUtils } from "../authentication/browserStringUtils";
import { IPKCEChallengeAndVerifierFactory, PKCEChallengAndVerifierFactory } from "../authentication/pkceChallengeAndVerifier";
import { AuthManager, IAuthManager } from "../authentication/authManager";
import { IApplicationSettings, ApplicationSettings } from "../applicationSettings";
import { IGuidFactory, GuidFactory } from "../guidFactory";
import { IAuthStateFactory, AuthStateFactory } from "../authStateFactory";
import { IHttpClient, HttpClient } from "../httpClient";

var container = new Container();

container.bind<BrowserFacade>(TYPES.BrowserFacade).to(ChromeBrowser);
container.bind<IBookmarkManager>(TYPES.IBookmarkManager).to(BookmarkManager);
container.bind<ISyncService>(TYPES.ISyncService).to(SyncService);

container.bind<ISyncListener>(TYPES.ISyncListener).to(SyncListener);
container.bind<IOptionsListener>(TYPES.IOptionsListener).to(OptionsListener);
container.bind<IOmniboxListener>(TYPES.IOmniboxListener).to(OmniboxListener);
container.bind<IAuthListener>(TYPES.IAuthListener).to(AuthListener);

container.bind<IQueryStringBuilder>(TYPES.IQueryStringBuilder).to(QueryStringBuilder);
container.bind<IScopeQueryStringFormatter>(TYPES.IScopeQueryStringFormatter).to(ScopeQueryStringFormatter);
container.bind<IBase64Encode>(TYPES.IBase64Encode).to(Base64Encode);
container.bind<IBrowserStringUtils>(TYPES.IBrowserStringUtils).to(BrowserStringUtils);
container.bind<IMSAAuthHelper>(TYPES.IMSAAuthHelper).to(MSAAuthHelper);
container.bind<IPKCEChallengeAndVerifierFactory>(TYPES.IPKCEChallengeAndVerifierFactory).to(PKCEChallengAndVerifierFactory);
container.bind<IAuthManager>(TYPES.IAuthManager).to(AuthManager);
container.bind<IApplicationSettings>(TYPES.IApplicationSettings).to(ApplicationSettings);
container.bind<IGuidFactory>(TYPES.IGuidFactory).to(GuidFactory);
container.bind<IAuthStateFactory>(TYPES.IAuthStateFactory).to(AuthStateFactory);
container.bind<IHttpClient>(TYPES.IHttpClient).to(HttpClient);

export default container;