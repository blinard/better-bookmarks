export class Bookmark {
    static hydrateNewBookmark(existingBookmark: Bookmark): Bookmark {
        return new Bookmark(existingBookmark._key, existingBookmark._url, existingBookmark._tags);
    }
    
    constructor(private _key: string, private _url: string, private _tags?: string) {
    }

    get key(): string {
        return this._key;
    }

    get url(): string {
        return this._url;
    }

    get tags(): string {
        return this._tags
    }
}