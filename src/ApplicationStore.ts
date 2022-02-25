import { SelectionStore } from "./SelectionStore";
import { BookmarkStore } from "./BookmarkStore";
import { FormatDefinitionStore } from "./FormatDefinitionStore";
import { DataStore } from "./DataStore";

export class ApplicationStore {
  public selectionStore: SelectionStore;
  public bookmarkStore = new BookmarkStore();
  public formatDefinitionStore: FormatDefinitionStore;

  constructor(public fileStore: DataStore) {
    this.selectionStore = new SelectionStore(fileStore.data);
    this.formatDefinitionStore = new FormatDefinitionStore(fileStore);
  }
}
