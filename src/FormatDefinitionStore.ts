import { FormatDefinition } from "./formatreader/FormatDefinition";

import { BMPFormatDefinition } from "./definitions/BMPFormatDefinition";
import { PNGFormatDefinition } from "./definitions/PNGFormatDefinition";
import { EXEFormatDefinition } from "./definitions/EXEFormatDefinition";
import { CFBFormatDefinition } from "./definitions/CFBFormatDefinition";

export class FormatDefinitionStore {
  private formatDefinition: FormatDefinition | undefined;

  constructor(dataName: string) {
    this.inferFormatFromDataName(dataName);
  }

  public get hasFormatDefinition(): boolean {
    return this.formatDefinition !== undefined;
  }

  public getFormatDefinition(): FormatDefinition {
    if (this.formatDefinition === undefined) {
      throw new Error("No format definition is available");
    }

    return this.formatDefinition;
  }

  private inferFormatFromDataName(dataName: string): void {
    // Assume data name is like a file name with an extension
    const [extension] = dataName.toLocaleLowerCase().split(".").reverse();

    if (["doc", "ppt", "xls"].includes(extension)) {
      this.formatDefinition = new CFBFormatDefinition();
    } else if (["bmp", "dib"].includes(extension)) {
      this.formatDefinition = new BMPFormatDefinition();
    } else if (["exe", "dll", "ocx"].includes(extension)) {
      this.formatDefinition = new EXEFormatDefinition();
    } else if (["png"].includes(extension)) {
      this.formatDefinition = new PNGFormatDefinition();
    }
  }
}
