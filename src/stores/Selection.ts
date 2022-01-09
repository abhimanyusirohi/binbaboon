export class Selection {
  public normalisedSelection: Selection;

  constructor(public fromOffset: number, public toOffset: number) {
    this.normalisedSelection = this;

    // If the selection is in reverse direction
    if (this.fromOffset > this.toOffset) {
      this.normalisedSelection = new Selection(this.toOffset, this.fromOffset);
    }
  }

  public get size(): number {
    return this.normalisedSelection.toOffset - this.normalisedSelection.fromOffset + 1;
  }

  public contains(selection: Selection): boolean {
    return (
      this.normalisedSelection.fromOffset <= selection.fromOffset &&
      this.normalisedSelection.toOffset >= selection.toOffset
    );
  }

  public containsOffset(offset: number): boolean {
    return offset >= this.normalisedSelection.fromOffset && offset <= this.normalisedSelection.toOffset;
  }

  public equals(selection: Selection): boolean {
    return this.fromOffset === selection.fromOffset && this.toOffset === selection.toOffset;
  }
}
