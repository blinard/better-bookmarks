import { TestBed, inject } from '@angular/core/testing';

import { BookmarkManagerService } from './bookmark-manager.service';

describe('BookmarkManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BookmarkManagerService]
    });
  });

  it('should be created', inject([BookmarkManagerService], (service: BookmarkManagerService) => {
    expect(service).toBeTruthy();
  }));
});
