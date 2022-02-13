import { makeObservable, observable, action, computed } from "mobx";

import { Selection } from "./Selection";

const MaxLength = 1024;

export class Bookmark {
  public description: string | null = null;
  public parent: Bookmark | null = null;
  public children: BookmarkCollection = new BookmarkCollection();

  constructor(public name: string, public selection: Selection) {}
}

export class BookmarkCollection {
  public bookmarks: Bookmark[] = [];

  constructor() {
    makeObservable(this, {
      bookmarks: observable,
      hasBookmarks: computed,
      count: computed,
      add: action,
      delete: action
    });
  }

  public get hasBookmarks(): boolean {
    return this.bookmarks.length > 0;
  }

  public get count(): number {
    return this.bookmarks.length + this.bookmarks.reduce((count, bookmark) => count + bookmark.children.count, 0);
  }

  public add(name: string, description: string, selection: Selection): Bookmark {
    if (name.trim().length === 0) {
      throw new Error(`Bookmark name is not valid`);
    }

    if (name.length > MaxLength) {
      throw new Error(`Bookmark name is too long. Must be less than ${MaxLength} characters`);
    }

    if (description.length > MaxLength) {
      throw new Error(`Bookmark description is too long. Must be less than ${MaxLength} characters`);
    }

    const foundByName = this.find(name);
    if (foundByName) {
      throw new Error(`Bookmark with name "${foundByName.name}" already exists`);
    }

    const foundBySelection = this.findBySelection(selection);
    if (foundBySelection) {
      throw new Error(`There is already a bookmark named "${foundBySelection.name}" with that selection`);
    }

    const bookmark = new Bookmark(name, selection);
    bookmark.description = description;

    this.insert(bookmark);
    return bookmark;
  }

  public find(name: string): Bookmark | null {
    for (const bookmark of this.bookmarks) {
      if (bookmark.name.toLocaleLowerCase() === name.toLocaleLowerCase()) {
        return bookmark;
      }

      const found = bookmark.children.find(name);
      if (found) {
        return found;
      }
    }

    return null;
  }

  public findBySelection(selection: Selection): Bookmark | null {
    for (const bookmark of this.bookmarks) {
      if (bookmark.selection.equals(selection)) {
        return bookmark;
      }

      const found = bookmark.children.findBySelection(selection);
      if (found) {
        return found;
      }
    }

    return null;
  }

  /**
   * Find all bookmarks whose starting offset lies in the specified offset range
   */
  public findByOffsetRange(fromOffset: number, toOffset: number): Bookmark[] {
    const rangeSelection = new Selection(fromOffset, toOffset);

    const matchingBookmarks: Bookmark[] = [];
    for (const bookmark of this.bookmarks) {
      if (rangeSelection.containsOffset(bookmark.selection.fromOffset)) {
        matchingBookmarks.push(bookmark);
      }
      matchingBookmarks.push(...bookmark.children.findByOffsetRange(fromOffset, toOffset));
    }

    return matchingBookmarks;
  }

  public delete(name: string): void {
    this.bookmarks.forEach((bookmark, index) => {
      if (bookmark.name.toLocaleLowerCase() === name.toLocaleLowerCase()) {
        this.bookmarks.splice(index, 1);
      } else {
        bookmark.children.delete(name);
      }
    });
  }

  /**
   * Recursively finds a place for the specified bookmark in the hierarchy
   *
   * @param bookmark Bookmark to insert in the hierarchy
   */
  private insert(bookmark: Bookmark): void {
    //TODO: Check if this bookmark is a parent of other bookmarks

    // Check if this bookmark is a child of some other bookmark
    const parentBookmark = this.bookmarks.find((b) => b.selection.contains(bookmark.selection));
    if (parentBookmark) {
      bookmark.parent = parentBookmark;
      parentBookmark.children.insert(bookmark);
    } else {
      // This bookmark is not a child, find its position by finding a bookmark
      // whose starting offset is larger than this bookmark's starting offset
      const positionIndex = this.bookmarks.findIndex((b) => b.selection.fromOffset > bookmark.selection.fromOffset);
      if (positionIndex === -1) {
        // There are no bookmarks or all have smaller starting offsets
        this.bookmarks.push(bookmark);
      } else {
        // Insert the bookmark before the bookmark that has larger index
        this.bookmarks.splice(positionIndex, 0, bookmark);
      }
    }
  }
}
