export default class Bookmarks {
    auth;
    constructor(authParam) {
        this.auth = authParam;
    }
    getAll() {
        const accessToken = this.auth && this.auth.getAccessToken();

        var req = new Request(
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

        // TODO: Implement success/error handling
        return fetch(req)
            .then(resp => {
                if (resp.status < 200 || resp.status >= 300) {
                    let messageString = `Error getting bookmarks. Status: ${resp.status}`;
                    throw new Error(messageString);
                }
                return resp.json();
            });
    }
}