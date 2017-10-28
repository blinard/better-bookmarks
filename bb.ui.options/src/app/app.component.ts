import { Component, OnInit } from '@angular/core';
import { Bookmark } from 'bb.models';
import { BookmarkManagerService } from './bookmark-manager.service';

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
    bookmarkManager.getBookmarks()
        .then((bookmarks: Bookmark[]) => {
            this.bookmarks = bookmarks;
        });
  }
}
