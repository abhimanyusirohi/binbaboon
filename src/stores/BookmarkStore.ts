import { makeObservable, observable, action, computed } from "mobx";

import { Bookmark, BookmarkCollection } from "./BookmarkCollection";

export class BookmarkStore {
  public bookmarkCollection: BookmarkCollection = new BookmarkCollection();
  private selectedBookmarkName: string | null = null;

  constructor() {
    makeObservable(this, {
      bookmarkCollection: observable,
      bookmarkCount: computed,
      selectBookmark: action
    });
  }

  public get bookmarkCount(): number {
    return this.bookmarkCollection.count;
  }

  public get selectedBookmark(): Bookmark | null {
    return this.selectedBookmarkName ? this.bookmarkCollection.find(this.selectedBookmarkName) : null;
  }

  public selectBookmark(name: string | null): void {
    this.selectedBookmarkName = name;
  }
}
