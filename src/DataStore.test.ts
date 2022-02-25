import { DataStore, FindOption } from "./DataStore";

describe("DataStore", () => {
  let fileStore: DataStore;

  beforeEach(() => {
    // Test data contains characters a-f and A-F
    const data = [..."abcdef", ..."ABCDEF"].map((value) => value.charCodeAt(0));
    fileStore = new DataStore("test.file", "test/file", new Uint8Array(data));
  });

  test("must find text case-sensitive by default", () => {
    const matches = fileStore.find("ab");
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 0, to: 1 }]);
  });

  test("must find text with case-insensitive option", () => {
    const matches = fileStore.find("ab", FindOption.IgnoreCase);
    expect(matches).toHaveLength(2);
    expect(matches).toMatchObject([
      { from: 0, to: 1 },
      { from: 6, to: 7 }
    ]);
  });

  test("must find text at the end", () => {
    const matches = fileStore.find("ef", FindOption.IgnoreCase);
    expect(matches).toHaveLength(2);
    expect(matches).toMatchObject([
      { from: 4, to: 5 },
      { from: 10, to: 11 }
    ]);
  });

  test("must find hex text value with spaces", () => {
    const matches = fileStore.find("61 62", FindOption.InterpretAsHex);
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 0, to: 1 }]);
  });

  test("must find hex text value without spaces", () => {
    const matches = fileStore.find("6162", FindOption.InterpretAsHex);
    expect(matches).toHaveLength(1);
    expect(matches).toMatchObject([{ from: 0, to: 1 }]);
  });

  test("must throw if hex value is not valid", () => {
    expect(() => fileStore.find("   ", FindOption.InterpretAsHex)).toThrow('"   " is not a valid hexadecimal string');
    expect(() => fileStore.find("XYZ", FindOption.InterpretAsHex)).toThrow('"XYZ" is not a valid hexadecimal string');
  });

  test("must return 1 match when maximum is set to 1", () => {
    const matches = fileStore.find("ab", FindOption.IgnoreCase, 1);
    expect(matches).toHaveLength(1);
  });
});
