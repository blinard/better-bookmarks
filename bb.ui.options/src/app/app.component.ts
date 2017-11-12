import { Component, OnInit } from '@angular/core';
import { Bookmark } from 'bb.models';
import { BookmarkManagerService } from './bookmark-manager.service';
import { IBookmarkManager } from 'bb.business';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    constructor(private bookmarkManagerService: BookmarkManagerService) {
    }
  title = 'Better Bookmarks';
  bookmarks: Bookmark[] = [];

  ngOnInit() {
    const bookmarkManager = this.bookmarkManagerService.getBookmarkManager();
    this.displayBookmarks(bookmarkManager);
  }

  deleteBookmark(bkmark: Bookmark): void {
      const bookmarkManager = this.bookmarkManagerService.getBookmarkManager();
      bookmarkManager.deleteBookmark(bkmark)
        .then(() => {
            this.displayBookmarks(bookmarkManager);
        });
    }

  private displayBookmarks(bookmarkManager: IBookmarkManager): void {
    bookmarkManager.getBookmarks()
        .then((bookmarks: Bookmark[]) => {
            this.bookmarks = bookmarks;
        });
  }
}
