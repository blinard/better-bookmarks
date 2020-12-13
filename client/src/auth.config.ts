
// TODO: Sync Endpoint is not specific to authentication. Rename this to something non-specific to authentication?

export interface AuthenticationConfig {
    AUTH0_DOMAIN: string;
    AUTH0_CLIENT_ID: string;
    AUDIENCE: string;
    SYNC_ENDPOINT: string;
    BBAuthUrlBase: string
}

export const authConfig: AuthenticationConfig = {
  AUTH0_DOMAIN: 'betterbookmarks.auth0.com',
  AUTH0_CLIENT_ID: '0zcROlNg3IBulToh1PEAGSkjfYmfsrBT',
  AUDIENCE: 'https://betterbookmarks.com/api',
  SYNC_ENDPOINT: 'https://bbfunction.azurewebsites.net/api/sync',
  BBAuthUrlBase: 'https://bbfunction.azurewebsites.net'
};
