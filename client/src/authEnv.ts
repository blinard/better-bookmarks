
//TODO: Maybe just rename this to Config or something non-specific to authentication

export interface AuthenticationConfig {
    AUTH0_DOMAIN: string;
    AUTH0_CLIENT_ID: string;
    AUDIENCE: string;
    SYNC_ENDPOINT: string;
}

export const authEnv: AuthenticationConfig = {
  AUTH0_DOMAIN: 'betterbookmarks.auth0.com',
  AUTH0_CLIENT_ID: '0zcROlNg3IBulToh1PEAGSkjfYmfsrBT',
  AUDIENCE: 'https://betterbookmarks.com/api',
  SYNC_ENDPOINT: 'https://better-bookmarks.com/api/bookmarks/sync'
};
