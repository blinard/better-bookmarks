import { history } from './History';
import { store } from '../store/configureStore';
import { actionCreators } from '../store/User';

export default class Auth {

  login() {
    // Cleared and not re-implemented after removal of Auth0
  }

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.renewSession = this.renewSession.bind(this);
    this.loginInChromeExtension = this.loginInChromeExtension.bind(this);
  }

  handleAuthentication() {
    // Cleared and not re-implemented after removal of Auth0
  }

  loginInChromeExtension() {
    let authResultPromise = new Promise((resolve, reject) => {
        window.chrome.runtime.onMessage.addListener((event) => {
          if (!event || !event.type || event.type !== "silentAuthResult") return;
          console.log("web authResult received:");
          console.log(event);
    
          if (event.authResult && event.authResult.name) {
              resolve(event.authResult);
              return;
          }

          reject();
        });
      })
    
    window.chrome.runtime.sendMessage({ type: "acquireTokenSilent" });
    
    authResultPromise
      .then((authResult) => {
        authResult.accessToken = authResult.access_token;
        authResult.idToken = authResult.id_token;
        authResult.expiresAt = authResult.expires_in * 1000 + new Date().getTime();
        store.dispatch(actionCreators.updateUser(authResult.accessToken, authResult.idToken, authResult.expiresAt));
    });
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    authResult.expiresAt = (authResult.expiresIn * 1000) + new Date().getTime();

    // Set isLoggedIn flag in localStorage
    localStorage.setItem('isLoggedIn', 'true');

    store.dispatch(actionCreators.updateUser(authResult.accessToken, authResult.idToken, authResult.expiresAt));

    // navigate to the home route
    history.replace('/');
  }

  renewSession() {
    // Cleared and not re-implemented after removal of Auth0
  }

  logout() {
    // Remove tokens and expiry time
    store.dispatch(actionCreators.updateUser(null, null, 0));

    // Remove isLoggedIn flag from localStorage
    localStorage.removeItem('isLoggedIn');

    // navigate to the home route
    history.replace('/');
  }

  isAuthenticated(user) {
    user = user || store.getState().user;

    // Check whether the current time is past the
    // access token's expiry time
    return new Date().getTime() < user.expiresAt;
  }
}