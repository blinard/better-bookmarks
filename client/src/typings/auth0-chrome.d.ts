declare module 'auth0-chrome' {

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

    export class Auth0Chrome {
        constructor(auth0Domain: string, auth0ClientId: string);

        authenticate(authOpts: AuthenticationOptions): Promise<AuthenticationResult>;
    }

}
