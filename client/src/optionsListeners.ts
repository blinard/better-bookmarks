import { ChromeBrowser } from './browserFacades/chromeBrowser';
import { BookmarkManager } from './bookmarkManager';

export function addOptionsListeners() {
    var browserFacade = new ChromeBrowser();
    browserFacade.addOnMessageListener(onMessageHandler);
}

// TODO: Consolidate type keys so that they're referenced from a common object
function onMessageHandler(event: any, sender: chrome.runtime.MessageSender, sendResponseCallback: (response: any) => void) {
    if (!sendResponseCallback) return;
    if (!event || !event.type || event.type !== 'bb-getauth') {
        return;
    }

    var authResult = JSON.parse(localStorage.authResult);
    sendResponseCallback(authResult);
    return true;
}
