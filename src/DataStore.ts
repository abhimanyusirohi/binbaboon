import { Record } from "./formatreader/Record";
import { FormatDefinitionStore } from "./FormatDefinitionStore";
import { ByteOrder } from "./formatreader/FormatDefinition";

export interface Match {
  from: number;
  to: number;
}

export enum FindOption {
  Default,
  IgnoreCase,
  InterpretAsHex
}

export interface DataFormatInfo {
  name: string;
  description: string;
  specificationUrl: string;
  byteOrdering: ByteOrder;
}

export class DataStore {
  private formatDefinitionStore;

  constructor(public readonly name: string, public readonly type: string, public readonly data: Uint8Array) {
    this.formatDefinitionStore = new FormatDefinitionStore(name);
  }

  public get size(): number {
    return this.data.length;
  }

  public get hasFormatDefinition(): boolean {
    return this.formatDefinitionStore.hasFormatDefinition;
  }

  public get formatInfo(): DataFormatInfo {
    const definition = this.formatDefinitionStore.getFormatDefinition();
    return {
      name: definition.name,
      description: definition.description,
      specificationUrl: definition.specificationUrl,
      byteOrdering: definition.byteOrdering
    };
  }

  public applyFormatDefinition(): Record[] {
    if (!this.hasFormatDefinition) {
      throw new Error("No format definition available");
    }

    const format = this.formatDefinitionStore.getFormatDefinition();
    return format.read(this.data.buffer);
  }

  /**
   * Finds the specified text in data and returns one or more matches
   */
  public find(
    text: string,
    option: FindOption = FindOption.Default,
    maximumMatches = Number.MAX_SAFE_INTEGER
  ): Match[] {
    let searchText = text;
    const matches: Match[] = [];
    const lowercaseText = searchText.toLowerCase();
    const uppercaseText = searchText.toUpperCase();
    let comparePredicate = (value: number, index: number) => value === searchText.charCodeAt(index);
    if (option === FindOption.IgnoreCase) {
      comparePredicate = (value: number, index: number) =>
        value === lowercaseText.charCodeAt(index) || value === uppercaseText.charCodeAt(index);
    } else if (option === FindOption.InterpretAsHex) {
      searchText = hexStringToASCII(text);
    }

    let findIndex = 0;
    while (findIndex + searchText.length <= this.data.length && matches.length < maximumMatches) {
      const everyValueMatches = this.data.slice(findIndex, findIndex + searchText.length).every(comparePredicate);

      if (everyValueMatches) {
        matches.push({ from: findIndex, to: findIndex + searchText.length - 1 });
        findIndex += searchText.length;
      } else {
        findIndex++;
      }
    }

    return matches;
  }
}

/**
 * Converts the specified hex string to ASCII string
 * E.g. [0x61, 0x62] => "6162" => "ab", [0x41, 0x42] => "4142" => "AB"
 *
 * @param text Hex string in the form "6162" which means [0x61, 0x62]
 * @returns ASCII string
 */
function hexStringToASCII(text: string): string {
  // Remove spaces from between
  let hexString = text.replace(/\s/g, "");

  // Make sure the string only have allowed characters
  if (hexString.length === 0 || hexString.match(/^[a-f0-9]+$/i) === null) {
    throw new Error(`"${text}" is not a valid hexadecimal string`);
  }

  // Pad with a 0 if odd length
  hexString = (hexString.length % 2 === 0 ? "" : "0") + hexString;

  // Convert each pair e.g. FF to an integer value
  const bytes: number[] = [];
  for (let numberIndex = 0; numberIndex < hexString.length; numberIndex += 2) {
    bytes.push(parseInt(hexString.substring(numberIndex, numberIndex + 2), 16));
  }

  return String.fromCharCode(...bytes);
}
