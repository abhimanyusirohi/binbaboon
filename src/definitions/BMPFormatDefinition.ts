import { FormatDefinition } from "../formatreader/FormatDefinition";
import { RecordDefinition } from "../formatreader/RecordDefinition";
import { RepeatedRecordDefinition } from "../formatreader/RepeatedRecordDefinition";
import { FieldDefinition, OptionalFieldDefinition } from "../formatreader/FieldDefinition";

/**
 * BMP File Format
 * https://en.wikipedia.org/wiki/BMP_file_format
 *
 * @returns A definition for BMP file format
 */
export class BMPFormatDefinition extends FormatDefinition {
  constructor() {
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

    super("Bitmap", [header, infoHeader, colorTable, pixelData]);
  }
}
