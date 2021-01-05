init();

function init() {
    var bookmarksTable = document.getElementById("bookmarksTable");
    if (!bookmarksTable) {
        return;
    }

    chrome.runtime.sendMessage({ type: "bb-getbookmarks" }, (bookmarksArray) => {
        if (!bookmarksArray || bookmarksArray.length <= 0) {
            return;
        }

        var tbody = createTableBody(bookmarksTable);
        for (var i = 0; i < bookmarksArray.length; i++) {
            addBookmarkTableRow(tbody, bookmarksArray[i]);
        }
    });
}

function createTableBody(tbl) {
    var tbody = document.createElement("tbody");
    tbl.appendChild(tbody);
    return tbody;
}

function addBookmarkTableRow(tbody, bookmark) {
    var newRow = document.createElement("tr");
    tbody.appendChild(newRow);

    var keyCell = document.createElement("td");
    keyCell.innerText = bookmark.key;
    newRow.appendChild(keyCell);

    var urlCell = document.createElement("td");
    urlCell.innerText = bookmark.url;
    newRow.appendChild(urlCell);

    var tagsCell = document.createElement("td");
    tagsCell.innerText = "";
    newRow.appendChild(tagsCell);
}