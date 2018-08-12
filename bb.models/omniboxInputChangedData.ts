import {ISuggestResult} from "./ISuggestResult";

export class OmniboxInputChangedData {
    constructor(private _text: string, private _suggestFunc: (suggestions: ISuggestResult[]) => void) {
    }

    get text(): string {
        return this._text;
    }

    get suggestFunc(): ((suggestions: ISuggestResult[]) => void) {
        return this._suggestFunc;
    }
}