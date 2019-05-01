export default Auth0Chrome;

declare class Auth0Chrome {
    constructor(auth0Domain: string, auth0ClientId: string);

    authenticate(authOpts: Auth0Chrome.AuthenticationOptions): Promise<Auth0Chrome.AuthenticationResult>;
}

declare namespace Auth0Chrome {
    export interface AuthenticationOptions {
        scope: string;
        device: string;
        audience: string;
    }
    
    export interface AuthenticationResult {
        access_token: string;
        id_token: string;
        refresh_token?: string;
    }
}
