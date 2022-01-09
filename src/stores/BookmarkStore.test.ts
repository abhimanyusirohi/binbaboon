import { BookmarkStore } from "./BookmarkStore";
import { Selection } from "./Selection";

describe("BookmarkStore", () => {
  let store: BookmarkStore;

  beforeEach(() => {
    store = new BookmarkStore();
  });

  test("must add bookmark", () => {
    expect(store.bookmarkCount).toBe(0);
    store.addBookmark("testBookmark", "Test Bookmark", new Selection(0, 10));

    expect(store.bookmarkCount).toBe(1);
    expect(store.bookmarks[0]).toMatchObject({
      name: "testBookmark",
      description: "Test Bookmark",
      selection: { fromOffset: 0, toOffset: 10 }
    });
  });

  test("must throw if a bookmark name is empty or whitespace", () => {
    expect(() => store.addBookmark("", "", new Selection(0, 0))).toThrow(`Bookmark name is not valid`);
    expect(() => store.addBookmark("   ", "", new Selection(0, 0))).toThrow(`Bookmark name is not valid`);
  });

  test("must throw if a bookmark with same name already exists (case-sensitive)", () => {
    store.addBookmark("testBookmark", "", new Selection(0, 0));
    expect(() => store.addBookmark("testBookmark", "", new Selection(0, 0))).toThrow(
      `Bookmark with name "testBookmark" already exists`
    );
  });

  test("must throw if a bookmark with same name already exists (case-insensitive)", () => {
    store.addBookmark("testBookmark", "", new Selection(0, 0));
    expect(() => store.addBookmark("Testbookmark", "", new Selection(0, 0))).toThrow(
      `Bookmark with name "testBookmark" already exists`
    );
  });

  test("must throw if a bookmark with same selection already exists", () => {
    store.addBookmark("testBookmark", "", new Selection(10, 10));
    expect(() => store.addBookmark("secondBookmark", "", new Selection(10, 10))).toThrow(
      `There is already a bookmark named "testBookmark" with that selection`
    );
  });

  test("must throw if bookmark name is too long", () => {
    const longName = "a".repeat(1100);
    expect(() => store.addBookmark(longName, "", new Selection(0, 0))).toThrow(
      `Bookmark name is too long. Must be less than 1024 characters`
    );
  });

  test("must throw if bookmark description is too long", () => {
    const longDescription = "a".repeat(1100);
    expect(() => store.addBookmark("test", longDescription, new Selection(0, 0))).toThrow(
      `Bookmark description is too long. Must be less than 1024 characters`
    );
  });

  test("must find bookmark by name", () => {
    store.addBookmark("testBookmark", "Test Bookmark", new Selection(0, 10));

    expect(store.findBookmarkByName("testBookmark")).toMatchObject({
      name: "testBookmark",
      description: "Test Bookmark",
      selection: { fromOffset: 0, toOffset: 10 }
    });
  });

  test("must delete root level bookmark by name", () => {
    store.addBookmark("bookmark1", "", new Selection(10, 10));
    store.addBookmark("bookmark2", "", new Selection(20, 30));
    store.addBookmark("bookmark3", "", new Selection(40, 50));
    expect(store.bookmarkCount).toBe(3);

    store.deleteBookmark("bookmark2");
    expect(store.bookmarkCount).toBe(2);
    expect(store.bookmarks[0]).toMatchObject({
      name: "bookmark1",
      description: "",
      selection: { fromOffset: 10, toOffset: 10 }
    });

    expect(store.bookmarks[1]).toMatchObject({
      name: "bookmark3",
      description: "",
      selection: { fromOffset: 40, toOffset: 50 }
    });

    // Delete again must throw as it no longer exists
    expect(() => store.deleteBookmark("bookmark2")).toThrow(`Bookmark with name "bookmark2" does not exist`);
  });

  test("must delete child bookmark by name", () => {
    store.addBookmark("bookmark1", "", new Selection(10, 20));
    store.addBookmark("bookmark2", "", new Selection(20, 30));
    store.addBookmark("bookmark3", "", new Selection(40, 50));
    store.addBookmark("child1OfBookmark2", "", new Selection(21, 24));
    store.addBookmark("child2OfBookmark2", "", new Selection(25, 29));
    expect(store.bookmarkCount).toBe(5);

    store.deleteBookmark("child1OfBookmark2");
    expect(store.bookmarkCount).toBe(4);

    store.deleteBookmark("child2OfBookmark2");
    expect(store.bookmarkCount).toBe(3);
  });

  describe("bookmark ordering and hierarchy", () => {
    test("must return the correct order with multiple root bookmarks", () => {
      store.addBookmark("Length", "Field length", new Selection(10, 20));
      store.addBookmark("NumBytes", "Number of bytes", new Selection(30, 40));
      store.addBookmark("NumColors", "Number of colors", new Selection(0, 9));

      // All bookmarks should be at the root level as all selection ranges are separate
      expect(store.bookmarks).toHaveLength(3);

      // Bookmarks should be ordered according to the selection
      expect(store.bookmarks[0]).toMatchObject({
        name: "NumColors",
        description: "Number of colors",
        selection: { fromOffset: 0, toOffset: 9 }
      });

      expect(store.bookmarks[1]).toMatchObject({
        name: "Length",
        description: "Field length",
        selection: { fromOffset: 10, toOffset: 20 }
      });

      expect(store.bookmarks[2]).toMatchObject({
        name: "NumBytes",
        description: "Number of bytes",
        selection: { fromOffset: 30, toOffset: 40 }
      });
    });

    test("must return the correct hierarchy with one parent having two non overlapping children", () => {
      store.addBookmark("parent", "Parent", new Selection(0, 111));
      store.addBookmark("child1", "First child", new Selection(16, 47));
      store.addBookmark("child2", "Second child", new Selection(48, 79));
      store.addBookmark("child3", "Third child", new Selection(80, 95));

      // 1 parent bookmark with a child bookmark
      expect(store.bookmarks).toHaveLength(1);
      expect(store.bookmarks[0].children).toHaveLength(3);

      // Parent bookmark
      expect(store.bookmarks[0]).toMatchObject({
        name: "parent",
        description: "Parent",
        selection: { fromOffset: 0, toOffset: 111 }
      });

      // First child bookmark
      const children = store.bookmarks[0].children!;
      expect(children[0]).toMatchObject({
        name: "child1",
        description: "First child",
        selection: { fromOffset: 16, toOffset: 47 }
      });

      // Second child bookmark
      expect(children[1]).toMatchObject({
        name: "child2",
        description: "Second child",
        selection: { fromOffset: 48, toOffset: 79 }
      });

      // Third child bookmark
      expect(children[2]).toMatchObject({
        name: "child3",
        description: "Third child",
        selection: { fromOffset: 80, toOffset: 95 }
      });
    });
  });
});
