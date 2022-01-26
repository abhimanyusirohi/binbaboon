export class Selection {
  constructor(private from: number, private to: number) {
    // If the selection is in reverse direction, swap values
    if (this.from > this.to) {
      [this.from, this.to] = [this.to, this.from];
    }
  }

  public get fromOffset(): number {
    return this.from;
  }

  public get toOffset(): number {
    return this.to;
  }

  public get size(): number {
    return this.to - this.from + 1;
  }

  public contains(selection: Selection): boolean {
    return this.from <= selection.fromOffset && this.to >= selection.toOffset;
  }

  public containsOffset(offset: number): boolean {
    return offset >= this.from && offset <= this.to;
  }

  public equals(selection: Selection): boolean {
    return this.fromOffset === selection.fromOffset && this.toOffset === selection.toOffset;
  }
}
