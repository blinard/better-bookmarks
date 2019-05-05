import auth0 from 'auth0-js';
import { history } from './History';
import { store } from '../store/configureStore';
import { actionCreators } from '../store/User';

export default class Auth {
  auth0 = new auth0.WebAuth({
    domain: 'betterbookmarks.auth0.com',
    clientID: '0zcROlNg3IBulToh1PEAGSkjfYmfsrBT',
    redirectUri: 'http://localhost:5000/auth',
    responseType: 'token id_token',
    scope: 'openid profile',
    audience: 'https://betterbookmarks.com/api'
  });

  login() {
    this.auth0.authorize();
  }

  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.renewSession = this.renewSession.bind(this);
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        history.replace('/');
        console.log(err);
        alert(`Error: ${err.error}. Check the console for further details.`);
      }
    });
  }

  isInChromeExtension() {
    return window.location.protocol === "chrome-extension:";
  }

  loginInChromeExtension() {
    window.chrome.runtime.sendMessage({ type: "bb-getauth" }, (authResult) => {
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
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        this.logout();
        console.log(err);
        alert(`Could not get a new token (${err.error}: ${err.error_description}).`);
      }
    });
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