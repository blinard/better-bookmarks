import { Injectable } from '@angular/core';
import { BookmarkRepository } from 'bb.dataaccess';
import { BookmarkManager } from 'bb.business';
import { ChromeFacade } from 'bb.browserfacades.chrome';

@Injectable()
export class BookmarkManagerService {

  constructor() { }

  getBookmarkManager(): BookmarkManager {
      const chromeFacade = new ChromeFacade();
      const bookmarkRepository = new BookmarkRepository(chromeFacade);
      return new BookmarkManager(bookmarkRepository);
  }
}
