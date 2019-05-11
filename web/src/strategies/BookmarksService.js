
export default class BookmarksService {

  constructor() {
    this.getBookmarks = this.getBookmarks.bind(this);
    this.deleteBookmark = this.deleteBookmark.bind(this);
  }

  async getBookmarks(accessToken) {
    const req = new Request(
      "https://api.better-bookmarks.com/bookmarks",
      {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        mode: "cors",
        cache: "no-store"
      }
    );

    const resp = await fetch(req);
    if (resp.status < 200 || resp.status >= 300) {
      let messageString = `Error getting bookmarks. Status: ${resp.status}`;
      throw new Error(messageString);
    }

    return await resp.json();
  }

  async deleteBookmark(bookmark, accessToken) {
    const req = new Request(
      `https://api.better-bookmarks.com/bookmarks?bookmarkKey=${encodeURIComponent(bookmark.key)}`,
      {
        method: "DELETE",
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        mode: "cors",
        cache: "no-store"
      }
    );

    const resp = await fetch(req);
    if (resp.status < 200 || resp.status >= 300) {
      let messageString = `Error deleting bookmark. Status: ${resp.status}`;
      throw new Error(messageString);
    }
  }
}