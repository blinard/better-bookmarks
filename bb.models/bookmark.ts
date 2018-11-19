export interface IBookmark {
    key: string;
    url: string;
    tags: string | undefined;
}

export class Bookmark implements IBookmark {
    static hydrateNewBookmark(existingBookmark: IBookmark): IBookmark {
        let fullBookmark = existingBookmark as Bookmark;
        return new Bookmark(fullBookmark.key || fullBookmark._key, fullBookmark.url || fullBookmark._url, fullBookmark.tags || fullBookmark._tags);
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