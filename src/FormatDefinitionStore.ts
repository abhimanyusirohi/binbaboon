import { FormatDefinition } from "./formatreader/FormatDefinition";
import { Record } from "./formatreader/Record";

import { BMPFormatDefinition } from "./definitions/BMPFormatDefinition";
import { PNGFormatDefinition } from "./definitions/PNGFormatDefinition";
import { EXEFormatDefinition } from "./definitions/EXEFormatDefinition";
import { CFBFormatDefinition } from "./definitions/CFBFormatDefinition";

import { DataStore } from "./DataStore";

export class FormatDefinitionStore {
  private fileExtension: string;

  constructor(private dataStore: DataStore) {
    const [extension] = dataStore.name.split(".").reverse();
    this.fileExtension = extension.toLocaleLowerCase();
  }

  public get hasFormatDefinition(): boolean {
    return ["bmp", "png", "exe", "xls"].includes(this.fileExtension);
  }

  public readFile(): Record[] {
    const format = this.getFormatDefinition();
    return format.read(this.dataStore.data.buffer);
  }

  private getFormatDefinition(): FormatDefinition {
    switch (this.fileExtension) {
      case "bmp":
        return new BMPFormatDefinition();

      case "png":
        return new PNGFormatDefinition();

      case "exe":
        return new EXEFormatDefinition();

      case "xls":
        return new CFBFormatDefinition();

      default:
        throw new Error("No format definition available for extension: " + this.fileExtension);
    }
  }
}
