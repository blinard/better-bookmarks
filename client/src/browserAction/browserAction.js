import { authConfig } from "./auth.config.js";
import * as msal from "./msal-browser/index.es.js";

function isLoggedIn(token) {
  // The user is logged in if their token isn't expired
  return jwt_decode(token).exp > Date.now() / 1000;
}

function logout() {
  // Remove the idToken from storage
  localStorage.clear();
  main();
}

// Minimal jQuery
const $$ = document.querySelectorAll.bind(document);
const $  = document.querySelector.bind(document);


function renderProfileView(authResult) {
  $('.default').classList.add('hidden');
  $('.loading').classList.remove('hidden');
  fetch(`https://${authConfig.AUTH0_DOMAIN}/userinfo`, {
    headers: {
      'Authorization': `Bearer ${authResult.access_token}`
    }
  }).then(resp => resp.json()).then((profile) => {
    ['picture', 'name', 'nickname'].forEach((key) => {

       const element = $('.' +  key);   
       if( element.nodeName === 'DIV' ) {
         element.style.backgroundImage = 'url(' + profile[key] + ')';
         return;
       }

       element.textContent = profile[key];
    });
    $('.loading').classList.add('hidden');
    $('.profile').classList.remove('hidden');
    $('.logout-button').addEventListener('click', logout);
  }).catch(logout);
}


function renderDefaultView() {
  $('.default').classList.remove('hidden');
  $('.profile').classList.add('hidden');
  $('.loading').classList.add('hidden');

  $('.login-button').addEventListener('click', () => {
    $('.default').classList.add('hidden');
    $('.loading').classList.remove('hidden');

    var loginRequest = {
        scopes: ["user.read", "openid", "offline_access", "api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"] // optional Array<string>
    };
    // "openid", "offline_access", "api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync"
    /*
        https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=ab8d1625-d6be-4548-ab9f-0a0c0f958d6b&scope=user.read%20openid%20profile&redirect_uri=http%3A%2F%2Flocalhost%3A8080%2FbrowserAction%2FbrowserAction.html&client-request-id=ecfe9a3b-b43a-429e-bad3-38e28140f5fa&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.7.0&x-client-OS=&x-client-CPU=&client_info=1&code_challenge=qwoAUUylw3oqlX88BxQbKU9lu5K_LBUhzHezJzClhqI&code_challenge_method=S256&nonce=b51df905-d9eb-4caa-a1d6-f19d3002d663&state=eyJpZCI6IjdkNWU0Y2E0LTQyMzEtNGQwZC04ZjM3LTAzZWQwNmJiMzA4NSIsInRzIjoxNjA2MzI1OTg3LCJtZXRhIjp7ImludGVyYWN0aW9uVHlwZSI6InJlZGlyZWN0In19

        pefeencopjdpgkdkdpomklgfjkodmdhm.chromiumapp.org
        https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=ab8d1625-d6be-4548-ab9f-0a0c0f958d6b&scope=user.read%20openid%20profile&redirect_uri=https%3A%2F%2Fpefeencopjdpgkdkdpomklgfjkodmdhm.chromiumapp.org%2FbrowserAction%2FbrowserAction.html&client-request-id=ecfe9a3b-b43a-429e-bad3-38e28140f5fa&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.7.0&x-client-OS=&x-client-CPU=&client_info=1&code_challenge=qwoAUUylw3oqlX88BxQbKU9lu5K_LBUhzHezJzClhqI&code_challenge_method=S256&nonce=b51df905-d9eb-4caa-a1d6-f19d3002d663&state=eyJpZCI6IjdkNWU0Y2E0LTQyMzEtNGQwZC04ZjM3LTAzZWQwNmJiMzA4NSIsInRzIjoxNjA2MzI1OTg3LCJtZXRhIjp7ImludGVyYWN0aW9uVHlwZSI6InJlZGlyZWN0In19

        redirect url
        https://pefeencopjdpgkdkdpomklgfjkodmdhm.chromiumapp.org/browserAction/browserAction.html#code=<authorizationcode>&client_info=eyJ2ZXIiOiIxLjAiLCJzdWIiOiJBQUFBQUFBQUFBQUFBQUFBQUFBQUFNUGtldEs3SkVGTTVkazE3YWVwWExFIiwibmFtZSI6IkJyYWQgTGluYXJkIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiYnJhZC5saW5hcmRAb3V0bG9vay5jb20iLCJvaWQiOiIwMDAwMDAwMC0wMDAwLTAwMDAtNGQwZC1iMzBhYzk5OWQ3OGEiLCJ0aWQiOiI5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQiLCJob21lX29pZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC00ZDBkLWIzMGFjOTk5ZDc4YSIsInVpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC00ZDBkLWIzMGFjOTk5ZDc4YSIsInV0aWQiOiI5MTg4MDQwZC02YzY3LTRjNWItYjExMi0zNmEzMDRiNjZkYWQifQ&state=eyJpZCI6IjdkNWU0Y2E0LTQyMzEtNGQwZC04ZjM3LTAzZWQwNmJiMzA4NSIsInRzIjoxNjA2MzI1OTg3LCJtZXRhIjp7ImludGVyYWN0aW9uVHlwZSI6InJlZGlyZWN0In19

        AADSTS70011: The provided value for the input parameter 'scope' is not valid. One or more scopes in 'user.read openid offline_access api://ed176c3c-3ee4-4f0d-919d-6ff1e4f792aa/Bookmarks.Sync profile' are not compatible with each other.
    */

    try {
        msalInstance.getLoginStartUrl(loginRequest).then((loginStartUrl) => {
            console.log("LoginStartUrl: " + loginStartUrl);
            chrome.identity.launchWebAuthFlow({ url: loginStartUrl, interactive: true }, (redirectUrl) => {
                console.log("redirectUrl: " + redirectUrl);
                const hash = redirectUrl.substring(redirectUrl.indexOf("#"));
                console.log("hash: " + hash);
                msalInstance.handleChromeExtensionRedirect(hash).then((authResult) => {
                    console.log("Success?");
                    console.log(authResult);
                });
            });
        })
        // chrome.identity.launchWebAuthFlow({ url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=ab8d1625-d6be-4548-ab9f-0a0c0f958d6b&scope=user.read%20openid%20profile&redirect_uri=https%3A%2F%2Fpefeencopjdpgkdkdpomklgfjkodmdhm.chromiumapp.org%2FbrowserAction%2FbrowserAction.html&client-request-id=ecfe9a3b-b43a-429e-bad3-38e28140f5fa&response_mode=fragment&response_type=code&x-client-SKU=msal.js.browser&x-client-VER=2.7.0&x-client-OS=&x-client-CPU=&client_info=1&code_challenge=qwoAUUylw3oqlX88BxQbKU9lu5K_LBUhzHezJzClhqI&code_challenge_method=S256&nonce=b51df905-d9eb-4caa-a1d6-f19d3002d663&state=eyJpZCI6IjdkNWU0Y2E0LTQyMzEtNGQwZC04ZjM3LTAzZWQwNmJiMzA4NSIsInRzIjoxNjA2MzI1OTg3LCJtZXRhIjp7ImludGVyYWN0aW9uVHlwZSI6InJlZGlyZWN0In19", interactive: true }, (redirectUrl) => {

        //     //Grab responseHash from redirectUrl (everything after first #....including the hash symbol itself)
        //     handleHash
        //         //        const serverParams = BrowserProtocolUtils.parseServerResponseFromHash(responseHash);

        //     console.log(redirectUrl);
        // });
        // msalInstance.loginRedirect(loginRequest)
        // .then((tokenResponse) => {
        //     if (!tokenResponse) return;
        //     const accounts = msalInstance.getAllAccounts();
        // })
        // .catch((err) => {
        //     console.log(err);
        // });
    } catch (err) {
        // handle error
        console.log(err);
    }

    // chrome.runtime.sendMessage({
    //   type: "authenticate"
    // });
  });
}

let msalInstance;
function main () {
    const msalConfig = {
        auth: {
            clientId: 'ab8d1625-d6be-4548-ab9f-0a0c0f958d6b',
            redirectUri: chrome.identity.getRedirectURL('browserAction/browserAction.html')
        }
    };
    
    msalInstance = new msal.PublicClientApplication(msalConfig);
    if (!msalInstance) return;

    msalInstance.handleRedirectPromise().then((tokenResponse) => {
        console.log(tokenResponse);
        // Check if the tokenResponse is null
        // If the tokenResponse !== null, then you are coming back from a successful authentication redirect. 
        // If the tokenResponse === null, you are not coming back from an auth redirect.
    }).catch((error) => {
        // handle error, either in the library or coming back from the server
        console.log(error);
    });

    renderDefaultView();
//   const authResult = JSON.parse(localStorage.authResult || '{}');
//   const token = authResult.id_token;
//   if (token && isLoggedIn(token)) {
//     renderProfileView(authResult);
//   } else {
//     renderDefaultView();
//   }
}

document.addEventListener('DOMContentLoaded', main);
