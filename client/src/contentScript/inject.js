console.log("Executing content script");
const $  = document.querySelector.bind(document);

function main() {
    console.log("running main...");
    const authResponseText = $('#authResponse').innerText;

    console.log("Sending message to extension");
    console.log(authResponse);
    chrome.runtime.sendMessage({
        type: 'interactiveAuthResponse',
        authResponse: authResponseText
    });
}

main();
