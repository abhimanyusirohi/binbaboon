export interface Match {
  from: number;
  to: number;
}

export enum FindOption {
  Default,
  IgnoreCase,
  InterpretAsHex
}

export class FileInfo {
  constructor(public name: string, public size: number, public type: string, public data: Uint8Array) {}

  /**
   * Finds the specified text in data and returns one or more matches
   */
  public find(text: string, option: FindOption = FindOption.Default, maxHits = Number.MAX_SAFE_INTEGER): Match[] {
    let searchText = text;
    const matches: Match[] = [];
    const lowercaseText = searchText.toLowerCase();
    const uppercaseText = searchText.toUpperCase();
    let comparePredicate = (value: number, index: number) => value === searchText.charCodeAt(index);
    if (option === FindOption.IgnoreCase) {
      comparePredicate = (value: number, index: number) =>
        value === lowercaseText.charCodeAt(index) || value === uppercaseText.charCodeAt(index);
    } else if (option === FindOption.InterpretAsHex) {
      searchText = convertToHexString(text);
    }

    let findIndex = 0;
    while (findIndex + searchText.length < this.data.length && matches.length < maxHits) {
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

function convertToHexString(text: string): string {
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
