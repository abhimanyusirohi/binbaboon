import { Bookmark } from "./Bookmark";
import { BookmarkStore } from "./BookmarkStore";
import { Selection } from "./Selection";

describe("BookmarkStore", () => {
  let store: BookmarkStore;

  function addTestBookmark(): Bookmark {
    const bookmark = new Bookmark("bookmark", "Test Bookmark", new Selection(0, 10));
    store.add(bookmark);
    return bookmark;
  }

  beforeEach(() => {
    store = new BookmarkStore();
  });

  test("must add bookmark", () => {
    expect(store.count).toBe(0);
    addTestBookmark();
    expect(store.count).toBe(1);
  });

  test("must delete bookmark", () => {
    const bookmark = addTestBookmark();
    expect(store.count).toBe(1);

    store.delete(bookmark.id);
    expect(store.count).toBe(0);
  });

  test("must select bookmark", () => {
    expect(store.selectedBookmark).toBeNull();

    const bookmark = addTestBookmark();

    store.selectBookmark(bookmark.id);
    expect(store.selectedBookmark).toMatchObject({
      name: "bookmark",
      description: "Test Bookmark",
      selection: { fromOffset: 0, toOffset: 10 }
    });

    store.selectBookmark(null);
    expect(store.selectedBookmark).toBeNull();
  });

  test("must throw if a bookmark with same selection already exists", () => {
    const bookmark = addTestBookmark();
    expect(() => store.add(new Bookmark("bookmark2", "", bookmark.selection))).toThrow(
      `There is already a bookmark named "bookmark" with that selection`
    );
  });

  describe("find", () => {
    test("must find bookmark by id", () => {
      expect(store.find("unknown")).toBeNull();

      const bookmark = addTestBookmark();
      expect(store.find(bookmark.id)).toMatchObject({
        name: "bookmark",
        description: "Test Bookmark",
        selection: { fromOffset: 0, toOffset: 10 }
      });
    });

    test("must find bookmark by selection", () => {
      store.add(new Bookmark("bookmark1", "Test Bookmark 1", new Selection(0, 10)));
      store.add(new Bookmark("bookmark2", "Test Bookmark 2", new Selection(30, 40)));

      expect(store.findBySelection(new Selection(0, 10))).toMatchObject({
        name: "bookmark1",
        description: "Test Bookmark 1",
        selection: { fromOffset: 0, toOffset: 10 }
      });

      expect(store.findBySelection(new Selection(30, 40))).toMatchObject({
        name: "bookmark2",
        description: "Test Bookmark 2",
        selection: { fromOffset: 30, toOffset: 40 }
      });
    });

    test("must find all bookmarks in an offset range", () => {
      store.add(new Bookmark("bookmark1", "Test Bookmark 1", new Selection(0, 10)));
      store.add(new Bookmark("bookmark2", "Test Bookmark 2", new Selection(1, 5)));
      store.add(new Bookmark("bookmark3", "Test Bookmark 3", new Selection(3, 8)));

      expect(store.findByOffsetRange(1, 9)).toMatchObject([
        {
          name: "bookmark2",
          description: "Test Bookmark 2",
          selection: { fromOffset: 1, toOffset: 5 }
        },
        {
          name: "bookmark3",
          description: "Test Bookmark 3",
          selection: { fromOffset: 3, toOffset: 8 }
        }
      ]);
    });
  });

  describe("hierarchy tree", () => {
    test("must return the right order based on selection for independent non-overlapping bookmarks", () => {
      store.add(new Bookmark("C", "", new Selection(50, 60)));
      store.add(new Bookmark("A", "", new Selection(10, 20)));
      store.add(new Bookmark("D", "", new Selection(70, 80)));
      store.add(new Bookmark("B", "", new Selection(30, 40)));

      const tree = store.bookmarkTree;
      expect(tree).toMatchObject([
        {
          name: "A"
        },
        {
          name: "B"
        },
        {
          name: "C"
        },
        {
          name: "D"
        }
      ]);
    });

    test("must return a tree for simple hierarchy of non-overlapping bookmarks", () => {
      store.add(new Bookmark("A", "", new Selection(20, 100)));
      store.add(new Bookmark("B", "", new Selection(30, 40)));
      store.add(new Bookmark("C", "", new Selection(32, 38)));
      store.add(new Bookmark("D", "", new Selection(70, 80)));

      store.add(new Bookmark("X", "", new Selection(200, 400)));
      store.add(new Bookmark("Y", "", new Selection(250, 260)));
      store.add(new Bookmark("Z", "", new Selection(270, 280)));

      expect(store.bookmarkTree).toMatchObject([
        {
          name: "A",
          children: [
            {
              name: "B",
              children: [
                {
                  name: "C"
                }
              ]
            },
            {
              name: "D"
            }
          ]
        },
        {
          name: "X",
          children: [
            {
              name: "Y"
            },
            {
              name: "Z"
            }
          ]
        }
      ]);
    });

    test("must return the right order based on selection for overlapping bookmarks", () => {
      store.add(new Bookmark("A", "", new Selection(25, 75)));
      store.add(new Bookmark("B", "", new Selection(0, 49)));
      store.add(new Bookmark("C", "", new Selection(50, 100)));

      const tree = store.bookmarkTree;
      expect(tree).toMatchObject([
        {
          name: "B"
        },
        {
          name: "A"
        },
        {
          name: "C"
        }
      ]);
    });

    test("must return the right tree when a bookmark is in union of other bookmarks", () => {
      store.add(new Bookmark("A", "", new Selection(0, 20)));
      store.add(new Bookmark("B", "", new Selection(10, 30)));

      // This child is contained in the union of parents and in this
      // case the last parent B becomes the parent
      store.add(new Bookmark("C", "", new Selection(11, 19)));

      expect(store.count).toBe(3);
      expect(store.bookmarkTree).toMatchObject([
        {
          name: "A"
        },
        {
          name: "B",
          children: [
            {
              name: "C"
            }
          ]
        }
      ]);
    });
  });
});
