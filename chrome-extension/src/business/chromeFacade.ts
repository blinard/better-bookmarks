export class ChromeFacade {
    constructor() {
    }

    addOmniboxListeners(): void {
        // This event is fired each time the user updates the text in the omnibox,
        // as long as the extension's keyword mode is still active.
        chrome.omnibox.onInputChanged.addListener(
            function(text, suggest) {
                console.log('inputChanged: ' + text);
                suggest([
                    {content: text + " one", description: "the first one"},
                    {content: text + " number two", description: "the second entry"}
                ]);
            });
    
        // This event is fired with the user accepts the input in the omnibox.
        chrome.omnibox.onInputEntered.addListener(
            function(text) {
                console.log('inputEntered: ' + text);
                text = text.trim();
                //TODO: Handle this as a navigate in the future
                if (text.startsWith('go ') || text === 'go') return;

                alert('You just typed "' + text + '"');
        });
    }

    getCurrentTabUrl(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (!tabs || tabs.length === 0) {
                    reject('Current tab not found');
                    return;
                }

                resolve(tabs[0].url);
            });
        });
    }

    navigateCurrentTab(url: string): void {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.update(tabs[0].id, {url: url});
        });
    }
}