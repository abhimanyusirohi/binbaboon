import { Bookmark } from "./Bookmark";
import { Selection } from "./Selection";

describe("Bookmark", () => {
  test("must throw if a bookmark name is empty or whitespace", () => {
    expect(() => new Bookmark("", "", new Selection(0, 0))).toThrow(`Bookmark name is not valid`);
    expect(() => new Bookmark("   ", "", new Selection(0, 0))).toThrow(`Bookmark name is not valid`);
  });

  test("must throw if bookmark name is too long", () => {
    const longName = "a".repeat(1100);
    expect(() => new Bookmark(longName, "", new Selection(0, 0))).toThrow(
      `Bookmark name is too long. Must be less than 1024 characters`
    );
  });

  test("must throw if bookmark description is too long", () => {
    const longDescription = "a".repeat(1100);
    expect(() => new Bookmark("test", longDescription, new Selection(0, 0))).toThrow(
      `Bookmark description is too long. Must be less than 1024 characters`
    );
  });
});
