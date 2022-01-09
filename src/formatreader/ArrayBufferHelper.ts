import { ByteOrder } from "./Format";

export class ArrayBufferHelper {
  public static bufferAsUInt(buffer: ArrayBuffer, byteOrder: ByteOrder = ByteOrder.LittleEndian): number {
    const view = new DataView(buffer);
    if (view.byteLength === 1) {
      return view.getUint8(0);
    } else if (view.byteLength === 2) {
      return byteOrder === ByteOrder.LittleEndian ? view.getUint16(0, true) : view.getUint16(0, false);
    } else if (view.byteLength === 4) {
      return byteOrder === ByteOrder.LittleEndian ? view.getUint32(0, true) : view.getUint32(0, false);
    }

    throw new Error("Buffer could not be converted to UInt");
  }
}
