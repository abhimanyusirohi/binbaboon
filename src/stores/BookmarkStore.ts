import { makeObservable, observable, action, computed } from "mobx";

import { Selection } from "./Selection";
import { Record } from "../formatreader/Record";

export class Bookmark {
  public description: string | undefined;
  public children: Bookmark[] | undefined = [];
  public parent: Bookmark | undefined = undefined;

  constructor(public name: string, public selection: Selection) {
    makeObservable(this, {
      children: observable
    });
  }

  public get hasChildren(): boolean {
    return this.children !== undefined && this.children.length > 0;
  }
}

export class BookmarkStore {
  public bookmarks: Bookmark[] = [];

  private readonly MaxLength = 1024;
  private selectedBookmarkName: string | null = null;
  private bookmarkNameToObjectMap: Map<string, Bookmark> = new Map<string, Bookmark>();

  constructor() {
    // Typescript does not allow annotating private fields
    // https://mobx.js.org/observable-state.html#limitations
    makeObservable<BookmarkStore, "bookmarkNameToObjectMap">(this, {
      bookmarks: observable,
      bookmarkNameToObjectMap: observable,
      bookmarkCount: computed,
      selectBookmark: action,
      addBookmark: action,
      deleteBookmark: action
    });
  }

  public get bookmarkCount(): number {
    return this.bookmarkNameToObjectMap.size;
  }

  public addBookmark(name: string, description: string, selection: Selection): Bookmark {
    if (name.trim().length === 0) {
      throw new Error(`Bookmark name is not valid`);
    }

    const existingByName = this.findBookmarkByName(name);
    if (existingByName) {
      throw new Error(`Bookmark with name "${existingByName.name}" already exists`);
    }

    const existingBySelection = this.findBookmarkBySelection(selection);
    if (existingBySelection) {
      throw new Error(`There is already a bookmark named "${existingBySelection.name}" with that selection`);
    }

    if (name.length > this.MaxLength) {
      throw new Error(`Bookmark name is too long. Must be less than ${this.MaxLength} characters`);
    }

    if (description.length > this.MaxLength) {
      throw new Error(`Bookmark description is too long. Must be less than ${this.MaxLength} characters`);
    }

    const bookmark = new Bookmark(name, selection);
    bookmark.description = description;

    this.insertBookmark(bookmark, this.bookmarks);
    this.bookmarkNameToObjectMap.set(name.toLocaleLowerCase(), bookmark);

    return bookmark;
  }

  public get selectedBookmark(): Bookmark | null {
    return this.selectedBookmarkName ? this.findBookmarkByName(this.selectedBookmarkName) : null;
  }

  public selectBookmark(name: string | null): void {
    this.selectedBookmarkName = name;
  }

  public findBookmarkByName(name: string): Bookmark | null {
    const lowercaseName = name.toLocaleLowerCase();
    if (this.bookmarkNameToObjectMap.has(lowercaseName)) {
      return this.bookmarkNameToObjectMap.get(lowercaseName)!;
    }

    return null;
  }

  public findBookmarkBySelection(selection: Selection): Bookmark | null {
    for (const value of this.bookmarkNameToObjectMap.values()) {
      if (value.selection.equals(selection)) {
        return value;
      }
    }

    return null;
  }

  /**
   * Find all bookmarks whose starting offset lies in the specified offset range
   */
  public findBookmarksByOffsetRange(fromOffset: number, toOffset: number): Bookmark[] {
    const bookmarks: Bookmark[] = [];
    const rangeSelection = new Selection(fromOffset, toOffset);
    this.bookmarkNameToObjectMap.forEach((bookmark) => {
      if (rangeSelection.containsOffset(bookmark.selection.fromOffset)) {
        bookmarks.push(bookmark);
      }
    });

    return bookmarks;
  }

  public deleteBookmark(name: string): void {
    const existingByName = this.findBookmarkByName(name);
    if (!existingByName) {
      throw new Error(`Bookmark with name "${name}" does not exists`);
    }

    this.findAndDeleteBookmark(name, this.bookmarks);
  }

  public addBookmarksForRecords(records: Record[]): void {
    let recordOffset = 0;
    records.forEach((record) => {
      const recordSelection = new Selection(recordOffset, recordOffset + record.size);
      this.addBookmark(record.definition.name, record.definition.description ?? "", recordSelection);

      record.fields.forEach((field) => {
        const fieldSelection = new Selection(recordOffset, recordOffset + field.size);
        recordOffset += field.size;

        this.addBookmark(field.definition.name, field.definition.description ?? "", fieldSelection);
      });
    });
  }

  private findAndDeleteBookmark(name: string, bookmarks: Bookmark[]): void {
    const index = bookmarks.findIndex((b) => b.name === name);
    if (index !== -1) {
      bookmarks.splice(index, 1);
      this.bookmarkNameToObjectMap.delete(name.toLocaleLowerCase());
    } else {
      bookmarks.forEach((b) => b.children && this.findAndDeleteBookmark(name, b.children));
    }
  }

  //TODO: Improve by using sort()
  private insertBookmark(bookmark: Bookmark, bookmarks: Bookmark[] | undefined): void {
    // Iterate over tree nodes and find a place for this bookmark using its selection values
    if (!bookmarks) {
      bookmarks = [bookmark];
      return;
    }

    // Check if this bookmark is a child of some other bookmark
    const parentBookmarkIndex = bookmarks.findIndex((b) => b.selection.contains(bookmark.selection));
    if (parentBookmarkIndex !== -1) {
      // This bbookmark is a child, insert it into parent's children
      this.insertBookmark(bookmark, bookmarks[parentBookmarkIndex].children);
      bookmark.parent = bookmarks[parentBookmarkIndex];
    } else {
      // This bookmark is not a child, find its position by finding a bookmark
      // whose starting offset is larger than this bookmark's starting offset
      const positionIndex = bookmarks.findIndex((b) => b.selection.fromOffset > bookmark.selection.fromOffset);
      if (positionIndex === -1) {
        // There are no bookmarks or all have small starting offsets
        bookmarks.push(bookmark);
      } else {
        // Insert the bookmark before the bookmark that has larger index
        bookmarks.splice(positionIndex, 0, bookmark);
      }
    }
  }
}
