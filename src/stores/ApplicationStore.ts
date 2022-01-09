import { SelectionStore } from "./SelectionStore";
import { BookmarkStore } from "./BookmarkStore";
import { FormatDefinitionStore } from "./FormatDefinitionStore";

export class FileInfo {
  constructor(public name: string, public size: number, public type: string, public data: Uint8Array) {}
}

export class ApplicationStore {
  public selectionStore: SelectionStore;
  public bookmarkStore = new BookmarkStore();
  public formatDefinitionStore: FormatDefinitionStore;

  constructor(public fileInfo: FileInfo) {
    this.selectionStore = new SelectionStore(fileInfo.data);
    this.formatDefinitionStore = new FormatDefinitionStore(fileInfo);
  }
}
