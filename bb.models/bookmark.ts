export interface IBookmark {
    key: string;
    url: string;
    tags: string;
}

export class Bookmark implements IBookmark {
    static hydrateNewBookmark(existingBookmark: IBookmark): IBookmark {
        return new Bookmark(existingBookmark.key, existingBookmark.url, existingBookmark.tags);
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