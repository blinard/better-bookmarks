export interface IBookmark {
    key: string;
    url: string;
    tags: string | undefined;
}

export class Bookmark implements IBookmark {
    static hydrateNewBookmark(existingBookmark: Bookmark): IBookmark {
        return new Bookmark(existingBookmark.key || existingBookmark._key, existingBookmark.url || existingBookmark._url, existingBookmark.tags || existingBookmark._tags);
    }
    
    constructor(private _key: string, private _url: string, private _tags?: string) {
    }

    get key(): string {
        return this._key;
    }

    get url(): string {
        return this._url;
    }

    get tags(): string | undefined {
        return this._tags
    }
}