import { BookmarkCollection } from "./BookmarkCollection";
import { Selection } from "./Selection";

describe("BookmarkCollection", () => {
  let collection: BookmarkCollection;

  beforeEach(() => {
    collection = new BookmarkCollection();
  });

  describe("add", () => {
    test("must add bookmark", () => {
      expect(collection.count).toBe(0);
      collection.add("testBookmark", "Test Bookmark", new Selection(0, 10));

      expect(collection.count).toBe(1);
      expect(collection.hasBookmarks).toBeTruthy();

      expect(collection).toMatchObject({
        bookmarks: [
          {
            name: "testBookmark",
            description: "Test Bookmark",
            selection: { fromOffset: 0, toOffset: 10 }
          }
        ]
      });
    });

    test("must throw if a bookmark name is empty or whitespace", () => {
      expect(() => collection.add("", "", new Selection(0, 0))).toThrow(`Bookmark name is not valid`);
      expect(() => collection.add("   ", "", new Selection(0, 0))).toThrow(`Bookmark name is not valid`);
    });

    test("must throw if a bookmark with same name already exists (case-sensitive)", () => {
      collection.add("testBookmark", "", new Selection(0, 0));
      expect(() => collection.add("testBookmark", "", new Selection(0, 0))).toThrow(
        `Bookmark with name "testBookmark" already exists`
      );
    });

    test("must throw if a bookmark with same name already exists (case-insensitive)", () => {
      collection.add("testBookmark", "", new Selection(0, 0));
      expect(() => collection.add("Testbookmark", "", new Selection(0, 0))).toThrow(
        `Bookmark with name "testBookmark" already exists`
      );
    });

    test("must throw if a bookmark with same selection already exists", () => {
      collection.add("testBookmark", "", new Selection(10, 10));
      expect(() => collection.add("secondBookmark", "", new Selection(10, 10))).toThrow(
        `There is already a bookmark named "testBookmark" with that selection`
      );
    });

    test("must throw if bookmark name is too long", () => {
      const longName = "a".repeat(1100);
      expect(() => collection.add(longName, "", new Selection(0, 0))).toThrow(
        `Bookmark name is too long. Must be less than 1024 characters`
      );
    });

    test("must throw if bookmark description is too long", () => {
      const longDescription = "a".repeat(1100);
      expect(() => collection.add("test", longDescription, new Selection(0, 0))).toThrow(
        `Bookmark description is too long. Must be less than 1024 characters`
      );
    });
  });

  describe("find", () => {
    test("must find bookmark by name", () => {
      collection.add("testBookmark1", "Test Bookmark", new Selection(0, 10));
      collection.add("testBookmark2", "Test Bookmark", new Selection(20, 30));

      expect(collection.find("testBookmark1")).toMatchObject({
        name: "testBookmark1",
        description: "Test Bookmark",
        selection: { fromOffset: 0, toOffset: 10 }
      });

      expect(collection.find("testBookmark2")).toMatchObject({
        name: "testBookmark2",
        description: "Test Bookmark",
        selection: { fromOffset: 20, toOffset: 30 }
      });
    });

    test("must find nested bookmark by name", () => {
      collection.add("parent", "Parent", new Selection(0, 10));
      collection.add("child", "Child", new Selection(3, 8));

      expect(collection.find("child")).toMatchObject({
        name: "child",
        description: "Child",
        selection: { fromOffset: 3, toOffset: 8 }
      });
    });

    test("must find bookmark by selection", () => {
      collection.add("testBookmark", "Test Bookmark", new Selection(0, 10));
      collection.add("testBookmark2", "Test Bookmark", new Selection(30, 40));

      expect(collection.findBySelection(new Selection(0, 10))).toMatchObject({
        name: "testBookmark",
        description: "Test Bookmark",
        selection: { fromOffset: 0, toOffset: 10 }
      });

      expect(collection.findBySelection(new Selection(30, 40))).toMatchObject({
        name: "testBookmark2",
        description: "Test Bookmark",
        selection: { fromOffset: 30, toOffset: 40 }
      });
    });

    test("must find nested bookmark by selection", () => {
      collection.add("parent", "Parent", new Selection(0, 10));
      collection.add("child", "Child", new Selection(3, 8));

      expect(collection.findBySelection(new Selection(3, 8))).toMatchObject({
        name: "child",
        description: "Child",
        selection: { fromOffset: 3, toOffset: 8 }
      });
    });

    test("must find all bookmarks in an offset range", () => {
      collection.add("parent", "Parent", new Selection(0, 10));
      collection.add("child", "Child", new Selection(1, 5));
      collection.add("secondChild", "Child2", new Selection(3, 8));

      expect(collection.findByOffsetRange(1, 9)).toMatchObject([
        {
          name: "child",
          description: "Child",
          selection: { fromOffset: 1, toOffset: 5 }
        },
        {
          name: "secondChild",
          description: "Child2",
          selection: { fromOffset: 3, toOffset: 8 }
        }
      ]);
    });
  });

  describe("delete", () => {
    test("must delete bookmark by name", () => {
      collection.add("bookmark1", "1", new Selection(10, 10));
      collection.add("bookmark2", "2", new Selection(20, 30));
      collection.add("bookmark3", "3", new Selection(40, 50));
      expect(collection.count).toBe(3);

      collection.delete("bookmark2");
      expect(collection.count).toBe(2);
    });

    test("must delete nested bookmark by name", () => {
      collection.add("bookmark1", "", new Selection(10, 20));
      collection.add("bookmark2", "", new Selection(20, 30));
      collection.add("bookmark3", "", new Selection(40, 50));
      collection.add("child1OfBookmark2", "", new Selection(21, 24));
      collection.add("child2OfBookmark2", "", new Selection(25, 29));
      expect(collection.count).toBe(5);

      collection.delete("child1OfBookmark2");
      expect(collection.count).toBe(4);

      collection.delete("child2OfBookmark2");
      expect(collection.count).toBe(3);
    });
  });

  describe("bookmark ordering and hierarchy", () => {
    test("must return the correct order with multiple root bookmarks", () => {
      collection.add("Length", "Field length", new Selection(10, 20));
      collection.add("NumBytes", "Number of bytes", new Selection(30, 40));
      collection.add("NumColors", "Number of colors", new Selection(0, 9));

      // All bookmarks should be at the root level as all selection ranges are separate
      expect(collection.count).toBe(3);

      // Bookmarks should be ordered according to the selection
      expect(collection).toMatchObject({
        bookmarks: [
          {
            name: "NumColors",
            description: "Number of colors",
            selection: { fromOffset: 0, toOffset: 9 }
          },
          {
            name: "Length",
            description: "Field length",
            selection: { fromOffset: 10, toOffset: 20 }
          },
          {
            name: "NumBytes",
            description: "Number of bytes",
            selection: { fromOffset: 30, toOffset: 40 }
          }
        ]
      });
    });

    test("must return the correct hierarchy with one parent having three non overlapping children", () => {
      collection.add("parent", "Parent", new Selection(0, 111));
      collection.add("child1", "First child", new Selection(16, 47));
      collection.add("child2", "Second child", new Selection(48, 79));
      collection.add("child3", "Third child", new Selection(80, 95));

      // 1 parent bookmark with 3 child bookmark
      expect(collection.count).toBe(4);
      expect(collection).toMatchObject({
        bookmarks: [
          {
            name: "parent",
            description: "Parent",
            selection: { fromOffset: 0, toOffset: 111 },
            children: {
              bookmarks: [
                {
                  name: "child1",
                  description: "First child",
                  selection: { fromOffset: 16, toOffset: 47 }
                },
                {
                  name: "child2",
                  description: "Second child",
                  selection: { fromOffset: 48, toOffset: 79 }
                },
                {
                  name: "child3",
                  description: "Third child",
                  selection: { fromOffset: 80, toOffset: 95 }
                }
              ]
            }
          }
        ]
      });
    });
  });
});
