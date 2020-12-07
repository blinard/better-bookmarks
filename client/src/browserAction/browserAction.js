import { authConfig } from "./auth.config.js";
import * as msal from "./msal-browser/index.es.js";

function isLoggedIn(token) {
  // The user is logged in if their token isn't expired
  return jwt_decode(token).exp > Date.now() / 1000;
}

function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  renderDefaultView();
  // TODO: Logout properly through AADv2 logout endpoint
}

// Minimal jQuery
const $$ = document.querySelectorAll.bind(document);
const $  = document.querySelector.bind(document);

function renderProfileView(profile) {
  chrome.browserAction.setIcon({ path: "../images/bb-icon.png" });
  $('.default').classList.add('hidden');
  ['name'].forEach((key) => {

    const element = $('.' +  key);   
    if( element.nodeName === 'DIV' ) {
        element.style.backgroundImage = 'url(' + profile[key] + ')';
        return;
    }

    element.textContent = profile[key];
  });
  $('.profile').classList.remove('hidden');
  $('.logout-button').addEventListener('click', logout);
}


function renderDefaultView() {
  chrome.browserAction.setIcon({ path: "../images/bb-icon-disabled.png" });

  $('.default').classList.remove('hidden');
  $('.profile').classList.add('hidden');
  $('.loading').classList.add('hidden');

  $('.login-button').addEventListener('click', () => {
    $('.default').classList.add('hidden');
    $('.loading').classList.remove('hidden');

    chrome.runtime.sendMessage({
        type: "authenticate"
    });
  });
}

function main () {
    chrome.runtime.onMessage.addListener((event) => {
        console.log("authResult received:");
        console.log(event);
        if (!event || !event.type || event.type !== "authenticationResult") return;

        if (event.authResult && event.authResult.name) {
            renderProfileView(event.authResult);
            return;
        }

        renderDefaultView();
    });

    chrome.runtime.sendMessage({
        type: "acquireTokenSilent"
    });

    renderDefaultView();
}

document.addEventListener('DOMContentLoaded', main);
