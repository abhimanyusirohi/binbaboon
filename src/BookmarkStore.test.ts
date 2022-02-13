import { BookmarkStore } from "./BookmarkStore";
import { Selection } from "./Selection";

describe("BookmarkStore", () => {
  let store: BookmarkStore;

  beforeEach(() => {
    store = new BookmarkStore();
    store.bookmarkCollection.add("testBookmark", "Test Bookmark", new Selection(0, 10));
  });

  test("must select bookmark by name", () => {
    expect(store.selectedBookmark).toBeNull();

    store.selectBookmark("testBookmark");
    expect(store.selectedBookmark).toMatchObject({
      name: "testBookmark",
      description: "Test Bookmark",
      selection: { fromOffset: 0, toOffset: 10 }
    });

    store.selectBookmark(null);
    expect(store.selectedBookmark).toBeNull();
  });
});
