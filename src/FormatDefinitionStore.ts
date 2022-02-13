import { Format, ByteOrder } from "./formatreader/Format";
import { RecordDefinition } from "./formatreader/RecordDefinition";
import { RepeatedRecordDefinition } from "./formatreader/RepeatedRecordDefinition";
import { FieldDefinition, OptionalFieldDefinition } from "./formatreader/FieldDefinition";
import { Record } from "./formatreader/Record";

import { FileStore } from "./FileStore";

export class FormatDefinitionStore {
  private fileExtension: string;

  constructor(private fileStore: FileStore) {
    const [extension] = fileStore.name.split(".").reverse();
    this.fileExtension = extension.toLocaleLowerCase();
  }

  public get hasFormatDefinition(): boolean {
    return ["bmp", "png", "exe", "xls"].includes(this.fileExtension);
  }

  public readFile(): Record[] {
    const format = this.getFormatDefinition();
    return format.read(this.fileStore.data.buffer);
  }

  private getFormatDefinition(): Format {
    switch (this.fileExtension) {
      case "bmp":
        return this.getBitmapDefinition();

      case "png":
        return this.getPNGDefinition();

      case "exe":
        return this.getEXEDefinition();

      case "xls":
        return this.getCFBDefinition();

      default:
        throw new Error("No format definition available for extension: " + this.fileExtension);
    }
  }

  /**
   * BMP File Format
   * https://en.wikipedia.org/wiki/BMP_file_format
   *
   * @returns A definition for BMP file format
   */
  private getBitmapDefinition(): Format {
    const signatureField = new FieldDefinition("Signature", 2);

    // TODO: Add more descriptions
    signatureField.setDescriptionForValue(new Uint8Array([0x42, 0x4d]), "BMP or DIB File");
    signatureField.setDescriptionForValue(new Uint8Array([0x4d, 0x41]), "OS/2 struct bitmap array");

    const header = new RecordDefinition("Header", 14, [
      signatureField,
      new FieldDefinition("FileSize", 4),
      new FieldDefinition("reserved", 4),
      new FieldDefinition("DataOffset", 4)
    ]);

    const v2InfoHeaderSize = new Uint8Array([0x34, 0x00, 0x00, 0x00]);
    const v3InfoHeaderSize = new Uint8Array([0x38, 0x00, 0x00, 0x00]);
    const v4InfoHeaderSize = new Uint8Array([0x6c, 0x00, 0x00, 0x00]);
    const v5InfoHeaderSize = new Uint8Array([0x7c, 0x00, 0x00, 0x00]);
    const infoHeader = new RecordDefinition("InfoHeader", "InfoHeader.Size", [
      new FieldDefinition("Size", 4),
      new FieldDefinition("Image Width", 4),
      new FieldDefinition("Image Height", 4),
      new FieldDefinition("Planes (Bits per pixel)", 2),
      new FieldDefinition("BitsPerPixel", 2),
      new FieldDefinition("Compression", 4),
      new FieldDefinition("ImageSize", 4),
      new FieldDefinition("XPixelsPerMeter", 4),
      new FieldDefinition("YPixelsPerMeter", 4),
      new FieldDefinition("ColorTableColorCount", 4),
      new FieldDefinition("ImportantColors", 4),
      new OptionalFieldDefinition("Red Channel Bitmask", 4, [
        {
          fieldName: "Size",
          fieldValue: [v2InfoHeaderSize, v3InfoHeaderSize, v4InfoHeaderSize, v5InfoHeaderSize]
        }
      ]),
      new OptionalFieldDefinition("Green Channel Bitmask", 4, [
        {
          fieldName: "Size",
          fieldValue: [v2InfoHeaderSize, v3InfoHeaderSize, v4InfoHeaderSize, v5InfoHeaderSize]
        }
      ]),
      new OptionalFieldDefinition("Blue Channel Bitmask", 4, [
        {
          fieldName: "Size",
          fieldValue: [v2InfoHeaderSize, v3InfoHeaderSize, v4InfoHeaderSize, v5InfoHeaderSize]
        }
      ]),
      new OptionalFieldDefinition("Alpha Channel Bitmask", 4, [
        {
          fieldName: "Size",
          fieldValue: [v3InfoHeaderSize, v4InfoHeaderSize, v5InfoHeaderSize]
        }
      ]),
      new OptionalFieldDefinition("Color Space Type", 4, [
        { fieldName: "Size", fieldValue: [v4InfoHeaderSize, v5InfoHeaderSize] }
      ]),
      new OptionalFieldDefinition("Color Space Endpoints", 36, [
        { fieldName: "Size", fieldValue: [v4InfoHeaderSize, v5InfoHeaderSize] }
      ]),
      new OptionalFieldDefinition("Gamma for Red Channel", 4, [
        { fieldName: "Size", fieldValue: [v4InfoHeaderSize, v5InfoHeaderSize] }
      ]),
      new OptionalFieldDefinition("Gamma for Green Channel", 4, [
        { fieldName: "Size", fieldValue: [v4InfoHeaderSize, v5InfoHeaderSize] }
      ]),
      new OptionalFieldDefinition("Gamma for Blue Channel", 4, [
        { fieldName: "Size", fieldValue: [v4InfoHeaderSize, v5InfoHeaderSize] }
      ]),
      new OptionalFieldDefinition("Intent", 4, [{ fieldName: "Size", fieldValue: [v5InfoHeaderSize] }]),
      new OptionalFieldDefinition("ICC Profile Data", 4, [{ fieldName: "Size", fieldValue: [v5InfoHeaderSize] }]),
      new OptionalFieldDefinition("ICC Profile Size", 4, [{ fieldName: "Size", fieldValue: [v5InfoHeaderSize] }]),
      new OptionalFieldDefinition("reserved", 4, [{ fieldName: "Size", fieldValue: [v5InfoHeaderSize] }])
    ]);

    const colorTable = new RepeatedRecordDefinition("Color Table", "InfoHeader.ColorTableColorCount", [
      new FieldDefinition("Red", 1),
      new FieldDefinition("Green", 1),
      new FieldDefinition("Blue", 1),
      new FieldDefinition("reserved", 1)
    ]);

    const pixelData = new RecordDefinition("PixelData", "InfoHeader.ImageSize", [
      new FieldDefinition("Data", "InfoHeader.ImageSize")
    ]);

    return new Format("Bitmap", [header, infoHeader, colorTable, pixelData]);
  }

  /**
   * Portable Network Graphics (PNG) File Format
   * https://en.wikipedia.org/wiki/Portable_Network_Graphics
   *
   * @returns A definition for PNG file format
   */
  private getPNGDefinition(): Format {
    const header = new RecordDefinition("Header", 8, [
      new FieldDefinition("Signature1", 1),
      new FieldDefinition("Signature2", 3),
      new FieldDefinition("LineEnding", 2),
      new FieldDefinition("EOF", 1),
      new FieldDefinition("LineEnding", 1)
    ]);

    const chunk = new RepeatedRecordDefinition("Chunk", 12, [
      new FieldDefinition("Size", 4),
      new FieldDefinition("Type", 4),
      new FieldDefinition("Data", "Size"),
      new FieldDefinition("CRC", 4)
    ]);

    chunk.repeatCount = Number.MAX_VALUE;

    return new Format("Portable Network Graphics", [header, chunk], {
      byteOrder: ByteOrder.BigEndian
    });
  }

  /**
   * Microsoft's Portable Executable Format (EXE)
   * https://en.wikipedia.org/wiki/Portable_Executable
   *
   * @returns A definition for EXE file format
   */
  private getEXEDefinition(): Format {
    const dosHeader = new RecordDefinition("DOSHeader", "PESignatureOffset", [
      new FieldDefinition("Signature", 2),
      new FieldDefinition("Other", 58),
      new FieldDefinition("PESignatureOffset", 4)
    ]);

    const peSignature = new RecordDefinition("PESignature", 4, [new FieldDefinition("Signature", 4)]);

    const coffHeader = new RecordDefinition("COFFHeader", 20, [
      new FieldDefinition("Machine", 2),
      new FieldDefinition("NumberOfSections", 2),
      new FieldDefinition("TimeDateStamp", 4),
      new FieldDefinition("PointerToSymbolTable", 4),
      new FieldDefinition("NumberOfSymbols", 4),
      new FieldDefinition("SizeOfOptionalHeader", 2),
      new FieldDefinition("Characteristics", 2)
    ]);

    const PEMarker = new Uint8Array([0x0b, 0x01]);
    const PEPlusMarker = new Uint8Array([0x0b, 0x02]);

    const optionalStandardHeader = new RecordDefinition("OptionalStandardHeader", 28, [
      new FieldDefinition("Magic", 2),
      new FieldDefinition("MajorLinkerVersion", 1),
      new FieldDefinition("MinorLinkerVersion", 1),
      new FieldDefinition("SizeOfCode", 4),
      new FieldDefinition("SizeOfInitializedData", 4),
      new FieldDefinition("SizeOfUninitializedData", 4),
      new FieldDefinition("AddressOfEntryPoint", 4),
      new FieldDefinition("BaseOfCode", 4),
      new OptionalFieldDefinition("BaseOfData", 4, [{ fieldName: "Magic", fieldValue: [PEPlusMarker] }])
    ]);

    const optionalWinSpecificHeader = new RecordDefinition("OptionalWinSpecificHeader", 28, [
      // Only one of the following optional fields will be included
      new OptionalFieldDefinition("ImageBase", 4, [
        { fieldName: "OptionalStandardHeader.Magic", fieldValue: [PEMarker] }
      ]),
      new OptionalFieldDefinition("ImageBase", 8, [
        {
          fieldName: "OptionalStandardHeader.Magic",
          fieldValue: [PEPlusMarker]
        }
      ]),
      new FieldDefinition("SectionAlignment", 4),
      new FieldDefinition("FileAlignment", 4),
      new FieldDefinition("MajorOperatingSystemVersion", 2),
      new FieldDefinition("MinorOperatingSystemVersion", 2),
      new FieldDefinition("MajorImageVersion", 2),
      new FieldDefinition("MinorImageVersion", 2),
      new FieldDefinition("MajorSubsystemVersion", 2),
      new FieldDefinition("MinorSubsystemVersion", 2),
      new FieldDefinition("Win32VersionValue", 4),
      new FieldDefinition("SizeOfImage", 4),
      new FieldDefinition("SizeOfHeaders", 4),
      new FieldDefinition("CheckSum", 4),
      new FieldDefinition("Subsystem", 2),
      new FieldDefinition("DllCharacteristics", 2),

      new OptionalFieldDefinition("SizeOfStackReserve", 4, [
        { fieldName: "OptionalStandardHeader.Magic", fieldValue: [PEMarker] }
      ]),
      new OptionalFieldDefinition("SizeOfStackReserve", 8, [
        {
          fieldName: "OptionalStandardHeader.Magic",
          fieldValue: [PEPlusMarker]
        }
      ]),

      new OptionalFieldDefinition("SizeOfStackCommit", 4, [
        { fieldName: "OptionalStandardHeader.Magic", fieldValue: [PEMarker] }
      ]),
      new OptionalFieldDefinition("SizeOfStackCommit", 8, [
        {
          fieldName: "OptionalStandardHeader.Magic",
          fieldValue: [PEPlusMarker]
        }
      ]),

      new OptionalFieldDefinition("SizeOfHeapReserve", 4, [
        { fieldName: "OptionalStandardHeader.Magic", fieldValue: [PEMarker] }
      ]),
      new OptionalFieldDefinition("SizeOfHeapReserve", 8, [
        {
          fieldName: "OptionalStandardHeader.Magic",
          fieldValue: [PEPlusMarker]
        }
      ]),

      new OptionalFieldDefinition("SizeOfHeapCommit", 4, [
        { fieldName: "OptionalStandardHeader.Magic", fieldValue: [PEMarker] }
      ]),
      new OptionalFieldDefinition("SizeOfHeapCommit", 8, [
        {
          fieldName: "OptionalStandardHeader.Magic",
          fieldValue: [PEPlusMarker]
        }
      ]),

      new FieldDefinition("LoaderFlags", 4),
      new FieldDefinition("NumberOfRvaAndSizes", 4)
    ]);

    return new Format("Microsoft Portable Executable", [
      dosHeader,
      peSignature,
      coffHeader,
      optionalStandardHeader,
      optionalWinSpecificHeader
    ]);
  }

  /**
   * Microsoft Compound File Binary (CFB) File Format
   * https://en.wikipedia.org/wiki/Compound_File_Binary_Format
   *
   * @returns A definition for CFB file format
   */
  private getCFBDefinition(): Format {
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

    return new Format("Microsoft Compound File Binary", [header]);
  }
}
