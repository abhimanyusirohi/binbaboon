import { FormatDefinition, ByteOrder } from "../formatreader/FormatDefinition";
import { RecordDefinition } from "../formatreader/RecordDefinition";
import { RepeatedRecordDefinition } from "../formatreader/RepeatedRecordDefinition";
import { FieldDefinition } from "../formatreader/FieldDefinition";

/**
 * Portable Network Graphics (PNG) File Format
 * https://en.wikipedia.org/wiki/Portable_Network_Graphics
 *
 * @returns A definition for PNG file format
 */
export class PNGFormatDefinition extends FormatDefinition {
  constructor() {
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

    super("Portable Network Graphics", [header, chunk], {
      byteOrder: ByteOrder.BigEndian
    });
  }
}
