export class Bookmark {
    key: string;
    url: string;
    isDeleted: boolean;
    lastModified: string;
    tags: Array<string>;

    constructor(key: string, url: string) {
        this.key = key.toLowerCase().trim();
        this.url = url;
        this.lastModified = (new Date()).toJSON();
        this.tags = [];
        this.isDeleted = false;
    }
}