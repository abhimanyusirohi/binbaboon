import { makeObservable, observable, action, computed } from "mobx";

import { Bookmark } from "./Bookmark";
import { Selection } from "./Selection";

export class BookmarkStore {
  private bookmarks = new Map<string, Bookmark>();
  private selectedBookmarkId: string | null = null;

  constructor() {
    makeObservable<BookmarkStore, "selectedBookmarkId">(this, {
      selectedBookmarkId: observable
    });

    makeObservable<BookmarkStore, "bookmarks">(this, {
      bookmarks: observable
    });

    makeObservable(this, {
      count: computed,
      selectedBookmark: computed,
      bookmarkTree: computed,
      selectBookmark: action,
      add: action,
      delete: action
    });
  }

  public get count(): number {
    return this.bookmarks.size;
  }

  public get selectedBookmark(): Bookmark | null {
    return this.selectedBookmarkId && this.bookmarks.has(this.selectedBookmarkId)
      ? this.bookmarks.get(this.selectedBookmarkId)!
      : null;
  }

  public get bookmarkTree(): Bookmark[] {
    const bookmarks = [...this.bookmarks.values()];
    bookmarks.sort((a, b) => a.selection.fromOffset - b.selection.fromOffset);

    this.updateParentInfo(bookmarks);

    const tree: Bookmark[] = [];
    bookmarks.forEach((bookmark) => {
      if (bookmark.parent !== null) {
        this.bookmarks.get(bookmark.parent)!.children.push(bookmark);
      } else {
        tree.push(bookmark);
      }
    });

    return tree;
  }

  public selectBookmark(id: string | null): void {
    this.selectedBookmarkId = id;
  }

  public add(bookmark: Bookmark): void {
    const foundBySelection = this.findBySelection(bookmark.selection);
    if (foundBySelection) {
      throw new Error(`There is already a bookmark named "${foundBySelection.name}" with that selection`);
    }

    this.bookmarks.set(bookmark.id, bookmark);
  }

  public delete(id: string): void {
    if (!this.bookmarks.has(id)) {
      throw new Error(`A bookmark with id "${id}" does not exist`);
    }

    // Delete bookmark and all its children
    this.bookmarks.get(id)!.children.forEach((child) => this.delete(child.id));
    this.bookmarks.delete(id);
  }

  public find(id: string): Bookmark | null {
    return [...this.bookmarks.values()].find((bookmark) => bookmark.id === id) ?? null;
  }

  public findBySelection(selection: Selection): Bookmark | null {
    return [...this.bookmarks.values()].find((bookmark) => bookmark.selection.equals(selection)) ?? null;
  }

  /**
   * Find all bookmarks whose starting offset lies in the specified offset range
   */
  public findByOffsetRange(fromOffset: number, toOffset: number): Bookmark[] {
    const rangeSelection = new Selection(fromOffset, toOffset);
    return [...this.bookmarks.values()].filter((bookmark) =>
      rangeSelection.containsOffset(bookmark.selection.fromOffset)
    );
  }

  /**
   * Updates each bookmark in the existing bookmark map with parent information based on its selection value
   * E.g. if a bookmark's selection is contained inside another bookmark's selection then its
   * parent id is set to that bookmark
   */
  private updateParentInfo(bookmarks: Bookmark[]): void {
    bookmarks.forEach((bookmarkA) => {
      bookmarkA.children = [];
      bookmarks.forEach((bookmarkB) => {
        if (bookmarkA.id !== bookmarkB.id) {
          if (bookmarkB.selection.contains(bookmarkA.selection)) {
            bookmarkA.parent = bookmarkB.id;
          }
        }
      });
    });
  }
}
