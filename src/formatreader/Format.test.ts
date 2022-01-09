import { Format } from "./Format";
import { RecordDefinition } from "./RecordDefinition";
import { FieldDefinition } from "./FieldDefinition";
import { ArrayBufferHelper } from "./ArrayBufferHelper";

import { FileInfo } from "../stores/ApplicationStore";
import { FormatDefinitionStore } from "../stores/FormatDefinitionStore";

import fs from "fs";

describe("format reader", () => {
  test("read a format having one record with 3 fixed size fields", () => {
    const fieldDefinitions = [new FieldDefinition("X", 4), new FieldDefinition("Y", 4), new FieldDefinition("Z", 4)];
    const recordDefinition = new RecordDefinition("Position Record", 12, fieldDefinitions);

    const definitions: RecordDefinition[] = [];
    definitions.push(recordDefinition);

    const format = new Format("Test Format", definitions);

    const data = Buffer.from("XXXXYYYYZZZZ");
    const records = format.read(data);

    expect(records.length).toBe(1);
    expect(records[0].size).toBe(12);
    expect(records[0].fields.length).toBe(3);

    expect(records[0].fields[0].valueAsUTF8).toBe("XXXX");
    expect(records[0].fields[1].valueAsUTF8).toBe("YYYY");
    expect(records[0].fields[2].valueAsUTF8).toBe("ZZZZ");
  });

  test("read bitmap (BMP) format", () => {
    const data = fs.readFileSync("./src/test-data/sample.bmp");
    expect(data.length).toBe(3275658);

    const fileInfo = new FileInfo("sample.bmp", 0, "bmp", data);
    const store = new FormatDefinitionStore(fileInfo);
    expect(store.hasFormatDefinition).toBeTruthy();
    const records = store.readFile();
    expect(records.length).toBe(3);

    const headerRecord = records[0];
    expect(headerRecord.getFieldByName("Signature")!.valueAsUTF8).toBe("BM");
    expect(headerRecord.size).toBe(14);
    expect(ArrayBufferHelper.bufferAsUInt(headerRecord.getFieldByName("FileSize")!.value)).toBe(3275658);

    const infoRecord = records[1];
    const infoRecordSize = ArrayBufferHelper.bufferAsUInt(infoRecord.getFieldByName("Size")!.value);
    expect(infoRecord.size).toBe(infoRecordSize);
    expect(ArrayBufferHelper.bufferAsUInt(infoRecord.getFieldByName("Image Width")!.value)).toBe(1280);
    expect(ArrayBufferHelper.bufferAsUInt(infoRecord.getFieldByName("Image Height")!.value)).toBe(853);

    const dataRecord = records[2];
    expect(dataRecord.size).toBe(3275520);
    expect(dataRecord.getFieldByName("Data")!.value.byteLength).toBe(3275520);

    // console.log(printRecord(format, records[0]));
    // console.log(printRecord(format, records[1]));
    // console.log(printRecord(format, records[2]));
  });

  test("read portable network graphics (PNG) format", () => {
    const data = fs.readFileSync("./src/test-data/sample.png");
    expect(data.length).toBe(227963);

    const fileInfo = new FileInfo("sample.png", 0, "png", data);
    const store = new FormatDefinitionStore(fileInfo);
    expect(store.hasFormatDefinition).toBeTruthy();
    const records = store.readFile();
    expect(records.length).toBe(4);

    // console.log(printRecord(format, records[0]));
    // console.log(printRecord(format, records[1]));
    // console.log(printRecord(format, records[2]));
    // console.log(printRecord(format, records[3]));
  });

  test("read Microsoft portable executable (EXE) format -- not complete", () => {
    const data = fs.readFileSync("./src/test-data/notepad.exe");
    expect(data.length).toBe(202240);

    const fileInfo = new FileInfo("notepad.exe", 0, "exe", data);
    const store = new FormatDefinitionStore(fileInfo);
    expect(store.hasFormatDefinition).toBeTruthy();
    const records = store.readFile();
    expect(records.length).toBe(5);

    // console.log(printRecord(format, records[0]));
    // console.log(printRecord(format, records[1]));
    // console.log(printRecord(format, records[2]));
    // console.log(printRecord(format, records[3]));
    // console.log(printRecord(format, records[4]));
  });

  test("read Microsoft Compound File Binary (CFB) format -- not complete", () => {
    const data = fs.readFileSync("./src/test-data/sample.xls");
    expect(data.length).toBe(19456);

    const fileInfo = new FileInfo("sample.xls", 0, "cfb", data);
    const store = new FormatDefinitionStore(fileInfo);
    expect(store.hasFormatDefinition).toBeTruthy();
    const records = store.readFile();
    expect(records.length).toBe(1);

    // console.log(printRecord(format, records[0]));
    // console.log(printRecord(format, records[1]));
    // console.log(printRecord(format, records[2]));
    // console.log(printRecord(format, records[3]));
  });
});

// function printRecord(format: Format, record: Record): string {
//   let message = `${record.definition.name}`;
//   message += record.definition.description ? `- ${record.definition.description}` : "";
//   for (const f of record.fields) {
//     message += `\n\t${f.definition.name}[${f.definition.size}]: `;

//     if (f.value.byteLength === 0) {
//       message += `Data zero length`;
//       continue;
//     }

//     const buf = Buffer.from(f.value);
//     message += `\t0x${buf.toString("hex", 0, 10)}`;
//     if (f.value.byteLength <= 4) {
//       message += `\tInt=${format.bufferAsUInt(f.value)}`;
//     }
//   }

//   return message;
// }
