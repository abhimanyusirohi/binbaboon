import { SelectionStore } from "./SelectionStore";
import { BookmarkStore } from "./BookmarkStore";
import { FormatDefinitionStore } from "./FormatDefinitionStore";
import { FileInfo } from "./FileInfo";

export class ApplicationStore {
  public selectionStore: SelectionStore;
  public bookmarkStore = new BookmarkStore();
  public formatDefinitionStore: FormatDefinitionStore;

  constructor(public fileInfo: FileInfo) {
    this.selectionStore = new SelectionStore(fileInfo.data);
    this.formatDefinitionStore = new FormatDefinitionStore(fileInfo);
  }
}
