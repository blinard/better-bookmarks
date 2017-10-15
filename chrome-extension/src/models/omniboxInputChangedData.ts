export class OmniboxInputChangedData {
    constructor(private _text: string, private _suggestFunc: (suggestions: chrome.omnibox.SuggestResult[]) => void) {
    }

    get text(): string {
        return this._text;
    }

    get suggestFunc(): ((suggestions: chrome.omnibox.SuggestResult[]) => void) {
        return this._suggestFunc;
    }
}