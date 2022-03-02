import { FormatDefinition } from "../formatreader/FormatDefinition";
import { RecordDefinition } from "../formatreader/RecordDefinition";
import { FieldDefinition, OptionalFieldDefinition } from "../formatreader/FieldDefinition";

/**
 * Microsoft's Portable Executable Format (EXE)
 * https://en.wikipedia.org/wiki/Portable_Executable
 *
 * @returns A definition for EXE file format
 */
export class EXEFormatDefinition extends FormatDefinition {
  constructor() {
    const dosHeader = new RecordDefinition("DOSHeader", "PESignatureOffset", [
      new FieldDefinition("Signature", 2),
      new FieldDefinition("Other", 58),
      new FieldDefinition("PESignatureOffset", 4),
      new FieldDefinition("PESignature", 4)
    ]);

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

    super("Microsoft Portable Executable", [dosHeader, coffHeader, optionalStandardHeader, optionalWinSpecificHeader]);

    this.description = "Microsoft's Portable Executable (PE) format";
    this.specificationUrl = "https://docs.microsoft.com/en-us/windows/win32/debug/pe-format";
  }
}
