export class Bookmark {
    constructor(key, url) {
        this.key = key.toLowerCase().trim();
        this.url = url;
    }
}