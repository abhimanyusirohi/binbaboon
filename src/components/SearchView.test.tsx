import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchView } from "./SearchView";
import { ApplicationStore } from "../ApplicationStore";
import { FileStore } from "../FileStore";

const maximumMatches = 10;

describe("SearchView", () => {
  let fileStore: FileStore;
  let store: ApplicationStore;

  beforeAll(() => {
    const numbers = [...Array<number>(10)].map((_, index) => index + 48);
    const upperCaseA2Z = [..."ABCDEF".repeat(6)].map((value) => value.charCodeAt(0));
    const lowerCaseA2Z = [..."abcdef".repeat(6)].map((value) => value.charCodeAt(0));

    const data = new Uint8Array([...numbers, ...upperCaseA2Z, ...lowerCaseA2Z]);
    fileStore = new FileStore("test.file", "test-file", data);
  });

  beforeEach(() => {
    store = new ApplicationStore(fileStore);
    render(
      <SearchView fileStore={store.fileStore} selectionStore={store.selectionStore} maximumMatches={maximumMatches} />
    );
  });

  describe("defaults", () => {
    test("must have default controls", () => {
      // Clickable header which is expanded by default
      expect(
        screen.getByRole("button", { name: "Search Search for text or hex values", expanded: true })
      ).toBeInTheDocument();

      // Make sure the search textbox and button are present
      expect(screen.getByPlaceholderText(/search text e.g. pdf/i)).toBeInTheDocument();
      expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Search" })).toBeDisabled();

      // Make sure the toggle-search-type and toggle-match-case buttons inside the textbox are present
      expect(screen.getByRole("checkbox", { name: "Toggle Search Type", checked: false })).toBeInTheDocument();
      expect(screen.getByRole("checkbox", { name: "Toggle Match Case", checked: false })).toBeInTheDocument();

      // The search-results container should not be displayed by default
      expect(screen.queryByTestId("search-results")).not.toBeInTheDocument();
    });

    test("must enable search button when search text is provided", () => {
      const searchTextbox = screen.getByRole("textbox", { name: "Search" });
      userEvent.type(searchTextbox, "a");

      expect(screen.getByRole("button", { name: "Search" })).toBeEnabled();
    });

    test("must hide match-case button when search type is hex", () => {
      expect(screen.getByRole("checkbox", { name: "Toggle Match Case" })).toBeInTheDocument();

      // Change to search type: hex
      const matchCaseCheckBox = screen.getByRole("checkbox", { name: "Toggle Search Type" });
      userEvent.click(matchCaseCheckBox);
      expect(matchCaseCheckBox).toBeChecked();

      expect(screen.queryByRole("checkbox", { name: "Toggle Match Case" })).toBeNull();
    });
  });

  describe("search", () => {
    test("must not show search results by default", () => {
      expect(screen.queryByTestId("search-results")).toBeNull();
    });

    test("must show zero matches for text that does not exist", () => {
      expectSearch("xyz", 0);
    });

    test("must correctly show controls for 1 match", () => {
      expectSearch("1", 1);
    });

    test("must search text with default search type (text - ignore case)", () => {
      expectSearch("abcdefab", 6);
    });

    test("must restrict matches to maximum match count", () => {
      // The followingg search gives 12 results but are restricted to 10
      expectSearch("abcdef", maximumMatches);
    });

    test("must search text with match-case option", () => {
      // Check the match-case button
      const matchCaseCheckBox = screen.getByRole("checkbox", { name: "Toggle Match Case" });
      userEvent.click(matchCaseCheckBox);
      expect(matchCaseCheckBox).toBeChecked();

      expectSearch("abcdef", 6);
    });

    test("must search hex value", () => {
      // Switch to hex search type
      const searchTypeCheckBox = screen.getByRole("checkbox", { name: "Toggle Search Type" });
      userEvent.click(searchTypeCheckBox);
      expect(searchTypeCheckBox).toBeChecked();

      // Searching for 0x6162 which is same as searching for "ab" with match-case
      expectSearch("6162", 6);
    });

    test("must select correct match in the list when next-previous match buttons are clicked", () => {
      const { previousMatchButton, nextMatchButton, matchList } = expectSearch("abcdefab", 6);

      // By default the first match is selected
      expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 10, toOffset: 17 });

      userEvent.click(nextMatchButton!);

      // Expect the second item in the list to be selected now
      const listItems = within(matchList!).getAllByRole("button");
      expect(listItems[1].className).toMatch(/selected/i);
      expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 22, toOffset: 29 });

      // Now click the previous button to go back to the first match
      expect(previousMatchButton).toBeEnabled();
      userEvent.click(previousMatchButton!);

      expect(listItems[0].className).toMatch(/selected/i);
      expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 10, toOffset: 17 });
    });

    test("must change selection when a match is clicked", () => {
      const { matchList } = expectSearch("abcdefab", 6);

      // By default the first match is selected
      expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 10, toOffset: 17 });

      // Click the third match in the list
      const listItems = within(matchList!).getAllByRole("button");
      userEvent.click(listItems[2]);

      expect(listItems[2].className).toMatch(/selected/i);
      expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 34, toOffset: 41 });
    });

    test("must close search results when close button is clicked", () => {
      const { resultsContainer } = expectSearch("abcdefab", 6);

      // The clickable close button inside the Chip
      const matchCountButton = within(resultsContainer).getByTestId("CancelIcon");

      expect(resultsContainer).toBeInTheDocument();
      userEvent.click(matchCountButton);

      expect(resultsContainer).not.toBeInTheDocument();
    });
  });
});

function doSearch(text: string) {
  // Type the text in search textbox
  const searchTextbox = screen.getByRole("textbox", { name: "Search" });
  userEvent.type(searchTextbox, text);

  // Click the search button
  const searchButton = screen.getByRole("button", { name: "Search" });
  userEvent.click(searchButton);
}

function expectMatchListToHaveItems(matchList: HTMLElement, count: number) {
  expect(matchList).toBeInTheDocument();

  // Expect the list of have count number of items (buttons)
  const listItems = within(matchList).getAllByRole("button");
  expect(listItems).toHaveLength(count);

  // Expect the first item in the list to be selected by default
  expect(listItems[0].className).toMatch(/selected/i);
}

function expectSearch(
  searchText: string,
  expectedMatchCount: number
): {
  resultsContainer: HTMLElement;
  previousMatchButton: HTMLElement | null;
  nextMatchButton: HTMLElement | null;
  matchList: HTMLElement | null;
} {
  doSearch(searchText);

  let matchText = `${expectedMatchCount} match${expectedMatchCount === 1 ? "" : "es"}`;
  const resultsContainer = screen.getByTestId("search-results");

  // When matches equal or exceed maximumMatches then a tooltip saying "First XX matches only"
  // is displayed on the chip that displays the match count
  matchText = expectedMatchCount >= maximumMatches ? `First ${maximumMatches} matches only` : matchText;
  expect(within(resultsContainer).getByRole("button", { name: matchText })).toBeInTheDocument();

  const previousMatchButton = within(resultsContainer).queryByRole("button", { name: "Previous Match" });
  const nextMatchButton = within(resultsContainer).queryByRole("button", { name: "Next Match" });
  const matchList = within(resultsContainer).queryByRole("list");

  if (expectedMatchCount === 0) {
    expect(previousMatchButton).toBeNull();
    expect(nextMatchButton).toBeNull();
    expect(matchList).toBeNull();
  } else if (expectedMatchCount === 1) {
    // For 1 match the previous/next buttons must be disabled
    expect(previousMatchButton).toBeDisabled();
    expect(nextMatchButton).toBeDisabled();

    // There must be exactly 1 item in the match list
    expectMatchListToHaveItems(matchList!, 1);
  } else {
    // For > 1 matches the previous button must be disabled and next must be enabled
    expect(previousMatchButton).toBeDisabled();
    expect(nextMatchButton).toBeEnabled();

    // There must be exactly 1 item in the match list
    expectMatchListToHaveItems(matchList!, expectedMatchCount);
  }

  return { resultsContainer, previousMatchButton, nextMatchButton, matchList };
}
