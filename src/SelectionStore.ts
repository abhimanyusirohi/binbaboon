import { makeObservable, observable, action, computed } from "mobx";

import { Selection } from "./Selection";

export class SelectionStore {
  public currentSelection: Selection;
  public scrollToSelectionSignal = false;

  constructor(private data: Uint8Array) {
    this.currentSelection = new Selection(0, 0);

    makeObservable(this, {
      currentSelection: observable,
      scrollToSelectionSignal: observable,
      selectedData: computed,
      setSelection: action,
      scrollToSelection: action
    });
  }

  public setSelection(selection: Selection): void {
    if (this.currentSelection.equals(selection)) {
      return;
    }

    this.currentSelection = selection;
  }

  public get selectedData(): Uint8Array {
    return this.data.slice(this.currentSelection.fromOffset, this.currentSelection.toOffset + 1);
  }

  public isValidSelection(selection: Selection): boolean {
    return selection.fromOffset >= 0 && selection.toOffset < this.data.byteLength;
  }

  /**
   * Changes the scroll-to-selection flag which acts as a signal
   */
  public scrollToSelection(): void {
    this.scrollToSelectionSignal = !this.scrollToSelectionSignal;
  }
}
