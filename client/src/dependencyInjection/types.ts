import { interfaces } from "inversify";

let TYPES = {
    BrowserFacade: Symbol("BrowserFacade"),
    IBookmarkManager: Symbol("IBookmarkManager"),
    ISyncService: Symbol("ISyncService"),
    ISyncListener: Symbol("ISyncListener"),
    IOptionsListener: Symbol("IOptionsListener"),
    IOmniboxListener: Symbol("IOmniboxListener"),
    IAuthListener: Symbol("IAuthListener"),
    Auth0ChromeFactory: Symbol("Factory<Auth0Chrome>"),
    IQueryStringBuilder: Symbol("IQueryStringBuilder"),
    IScopeQueryStringFormatter: Symbol("IScopeQueryStringFormatter"),
    IBase64Encode: Symbol("IBase64Encode"),
    IBrowserStringUtils: Symbol("IBrowserStringUtils"),
    IMSAAuthHelper: Symbol("IMSAAuthHelper"),
    IPKCEChallengeAndVerifierFactory: Symbol("IPKCEChallengeAndVerifierFactory"),
    IAuthManager: Symbol("IAuthManager"),
    IApplicationSettings: Symbol("IApplicationSettings"),
    IGuidFactory: Symbol("IGuidFactory"),
    IAuthStateFactory: Symbol("IAuthStateFactory"),
    IHttpClient: Symbol("IHttpClient")
};

export default TYPES;