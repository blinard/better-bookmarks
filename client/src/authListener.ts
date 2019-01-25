import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { authEnv } from './authEnv';
import { Auth0Chrome } from './typings/auth0-chrome';

export function addAuthListeners() {
    var browserFacade = new ChromeBrowser();
    browserFacade.addOnMessageListener(onMessageHandler);
}

function onMessageHandler(event: any) {
    if (!event || !event.type || event.type !== 'authenticate') {
        return;
    }

    var browserFacade = new ChromeBrowser();

    // scope
    //  - openid if you want an id_token returned
    //  - offline_access if you want a refresh_token returned
    //  - profile if you want an additional claims like name, nickname, picture and updated_at.
    // device
    //  - required if requesting the offline_access scope.
    let options = {
        scope: 'openid profile offline_access',
        device: 'chrome-extension',
        audience: 'https://betterbookmarks.com/api'
    };

    new Auth0Chrome(authEnv.AUTH0_DOMAIN, authEnv.AUTH0_CLIENT_ID)
        .authenticate(options)
        .then(function (authResult) {
            // TODO: Store in chrome.storage rather than localStorage.
            localStorage.authResult = JSON.stringify(authResult);
            browserFacade.setRefreshToken(<string>authResult.refresh_token);
            browserFacade.postNotification('Login Successful', 'Nice, you\'ve logged in!');
        })
        .catch(function (err) {
            browserFacade.postNotification('Login Failed', err.message);
        });
}
