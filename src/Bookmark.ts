import { Selection } from "./Selection";

const MaxLength = 1024;

export class Bookmark {
  public readonly id: string;
  public readonly name: string;
  public readonly selection: Selection;
  public readonly description: string | null = null;

  public parent: string | null = null;
  public children: Bookmark[] = [];

  constructor(inName: string, inDescription = "", inSelection: Selection) {
    if (inName.trim().length === 0) {
      throw new Error(`Bookmark name is not valid`);
    }

    if (inName.length > MaxLength) {
      throw new Error(`Bookmark name is too long. Must be less than ${MaxLength} characters`);
    }

    if (inDescription.length > MaxLength) {
      throw new Error(`Bookmark description is too long. Must be less than ${MaxLength} characters`);
    }

    // Generate a unique id for this bookmark
    this.id = Math.random().toString(36).slice(-6);

    this.name = inName;
    this.description = inDescription;
    this.selection = inSelection;
  }
}
