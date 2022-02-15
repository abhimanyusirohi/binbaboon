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

  test("must create tree", () => {
    store.add(new Bookmark("A", "", new Selection(20, 50)));
    store.add(new Bookmark("B", "", new Selection(30, 40)));
    store.add(new Bookmark("C", "", new Selection(40, 50)));
    store.add(new Bookmark("D", "", new Selection(32, 38)));

    const tree = store.bookmarkTree;

    expect(tree).toMatchObject([
      {
        name: "A",
        children: [
          {
            name: "B",
            children: [
              {
                name: "D"
              }
            ]
          },
          {
            name: "C"
          }
        ]
      }
    ]);
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

  describe("hierarchy", () => {
    test("must return the correct order with independent bookmarks", () => {
      store.add(new Bookmark("Length", "Field length", new Selection(10, 20)));
      store.add(new Bookmark("NumBytes", "Number of bytes", new Selection(30, 40)));
      store.add(new Bookmark("NumColors", "Number of colors", new Selection(0, 9)));

      expect(store.count).toBe(3);

      // Bookmarks should be ordered according to the selection
      expect(store.bookmarkTree).toMatchObject([
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
      ]);
    });

    test("must return the correct hierarchy with one parent having three non overlapping children", () => {
      store.add(new Bookmark("parent", "Parent", new Selection(0, 111)));
      store.add(new Bookmark("child1", "First child", new Selection(16, 47)));
      store.add(new Bookmark("child2", "Second child", new Selection(48, 79)));
      store.add(new Bookmark("child3", "Third child", new Selection(80, 95)));

      expect(store.count).toBe(4);
      const tree = store.bookmarkTree;
      expect(tree).toMatchObject([
        {
          name: "parent",
          description: "Parent",
          selection: { fromOffset: 0, toOffset: 111 },
          children: [
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
      ]);
    });
  });
});
