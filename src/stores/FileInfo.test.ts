import { FileInfo, FindOption } from "./FileInfo";

describe("FileInfo", () => {
  let fileInfo: FileInfo;

  beforeEach(() => {
    // Test data contains characters 0-255
    const data = [...Array<number>(256)].map((_, index) => index);
    fileInfo = new FileInfo("test.file", 74, "test/file", new Uint8Array(data));
  });

  test("must find text case-sensitive by default", () => {
    const matches = fileInfo.find("ab");
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 97, to: 98 }]);
  });

  test("must find text with case-insensitive option", () => {
    const matches = fileInfo.find("ab", FindOption.IgnoreCase);
    expect(matches).toHaveLength(2);
    expect(matches).toMatchObject([
      { from: 65, to: 66 },
      { from: 97, to: 98 }
    ]);
  });

  test("must return required number of hits", () => {
    const matches = fileInfo.find("ab", FindOption.IgnoreCase, 1);
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 65, to: 66 }]);
  });

  test("must find hex text value with spaces", () => {
    const matches = fileInfo.find("61 62", FindOption.InterpretAsHex);
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 97, to: 98 }]);
  });

  test("must find hex text value without spaces", () => {
    const matches = fileInfo.find("6162", FindOption.InterpretAsHex);
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 97, to: 98 }]);
  });

  test("must throw if hex value is not valid", () => {
    expect(() => fileInfo.find("   ", FindOption.InterpretAsHex)).toThrow('"   " is not a valid hexadecimal string');
    expect(() => fileInfo.find("XYZ", FindOption.InterpretAsHex)).toThrow('"XYZ" is not a valid hexadecimal string');
  });
});
