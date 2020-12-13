
function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  renderDefaultView();
  // TODO: Logout properly through AADv2 logout endpoint
}

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
  $('#btnLogout').addEventListener('click', logout);
}

function renderDefaultView() {
  chrome.browserAction.setIcon({ path: "../images/bb-icon-disabled.png" });

  $('.default').classList.remove('hidden');
  $('.profile').classList.add('hidden');
  $('.loading').classList.add('hidden');

  $('#btnLogin').addEventListener('click', () => {
    $('.default').classList.add('hidden');
    $('.loading').classList.remove('hidden');

    chrome.runtime.sendMessage({
        type: "initiateInteractiveAuth"
    });
  });
}

function main () {
    chrome.runtime.onMessage.addListener((event) => {
        console.log("authResult received:");
        console.log(event);
        if (!event || !event.type || event.type !== "silentAuthResult") return;

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
