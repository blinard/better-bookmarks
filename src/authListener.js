import {BrowserFacade} from './browserFacades/chromeBrowser';

export function addAuthListeners() {
    var browserFacade = new BrowserFacade();
    browserFacade.addOnMessageListener(onMessageHandler);
}

function onMessageHandler(event) {
    if (!event || !event.type || evnet.type !== 'authenticate') {
        return;
    }

    // scope
    //  - openid if you want an id_token returned
    //  - offline_access if you want a refresh_token returned
    //  - profile if you want an additional claims like name, nickname, picture and updated_at.
    // device
    //  - required if requesting the offline_access scope.
    let options = {
        scope: 'openid profile offline_access',
        device: 'chrome-extension'
    };

    new Auth0Chrome(authEnv.AUTH0_DOMAIN, authEnv.AUTH0_CLIENT_ID)
        .authenticate(options)
        .then(function (authResult) {
            localStorage.authResult = JSON.stringify(authResult);
            browserFacade.postNotification('Login Successful', 'Nice, you\'ve logged in!');
        })
        .catch(function (err) {
            browserFacade.postNotification('Login Failed', err.message);
        });
}
