import { FormatDefinition } from "../formatreader/FormatDefinition";
import { RecordDefinition } from "../formatreader/RecordDefinition";
import { FieldDefinition } from "../formatreader/FieldDefinition";

/**
 * Microsoft Compound File Binary (CFB) File Format
 * https://en.wikipedia.org/wiki/Compound_File_Binary_Format
 *
 * @returns A definition for CFB file format
 */
export class CFBFormatDefinition extends FormatDefinition {
  constructor() {
    const header = new RecordDefinition("Header", 512, [
      new FieldDefinition("Signature", 8),
      new FieldDefinition("CLSID", 16),
      new FieldDefinition("MinorVersion", 2),
      new FieldDefinition("MajorVersion", 2),
      new FieldDefinition("ByteOrder", 2),
      new FieldDefinition("SectorShift", 2),
      new FieldDefinition("MiniSectorShift", 2),
      new FieldDefinition("Reserved", 6),
      new FieldDefinition("NumberOfDirectorySectors", 4),
      new FieldDefinition("NumberOfFATSectors", 4),

      new FieldDefinition("First Directory Sector Location", 4),
      new FieldDefinition("TransactionSignatureNumber", 4),
      new FieldDefinition("MiniStreamCutoffSize", 4),
      new FieldDefinition("FirstMiniFATSectorLocation", 4),
      new FieldDefinition("NumberOfMiniFATSectors", 4),
      new FieldDefinition("FirstDIFATSectorLocation", 4),
      new FieldDefinition("NumberOfDIFATSectors", 4),
      new FieldDefinition("DIFAT", 436)
    ]);

    super("Compound File Binary", [header]);

    this.description = "Microsoft's Compound File Binary format";
    this.specificationUrl =
      "https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-cfb/53989ce4-7b05-4f8d-829b-d08d6148375b";
  }
}
