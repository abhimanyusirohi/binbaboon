import { SelectionStore } from "./SelectionStore";
import { BookmarkStore } from "./BookmarkStore";
import { DataStore } from "./DataStore";

export class ApplicationStore {
  public selectionStore: SelectionStore;
  public bookmarkStore = new BookmarkStore();

  constructor(public dataStore: DataStore) {
    this.selectionStore = new SelectionStore(dataStore.data);
  }
}
