
export default class BookmarksExtension {

  constructor() {
    this.getBookmarks = this.getBookmarks.bind(this);
    this.deleteBookmark = this.deleteBookmark.bind(this);
  }

  getBookmarks() {
    return new Promise((resolve, reject) => {
      window.chrome.runtime.sendMessage({ type: "bb-getbookmarks" }, (bookmarksArray) => {
        if (!bookmarksArray) {
          resolve([]);
          return;
        }
          
        resolve(bookmarksArray);
        return;
      });
    });
  }

  deleteBookmark(bookmark) {
    return new Promise((resolve, reject) => {
      window.chrome.runtime.sendMessage({ type: "bb-deletebookmark", bookmark: bookmark }, (result) => {
        resolve(result);
      });
    });
  }
}