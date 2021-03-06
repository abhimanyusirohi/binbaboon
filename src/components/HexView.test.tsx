import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HexView } from "./HexView";
import { ApplicationStore } from "../ApplicationStore";
import { DataStore } from "../DataStore";
import { AutoSizerProps } from "react-virtualized-auto-sizer";

// Mock the auto-sizer because we are using jest-dom for testing and the
// height and width will be always 0 which will prevent children from rendering
jest.mock(
  "react-virtualized-auto-sizer",
  () =>
    ({ children }: AutoSizerProps) =>
      children({ height: 600, width: 600 })
);

describe("HexView", () => {
  let dataStore: DataStore;
  let store: ApplicationStore;

  beforeAll(() => {
    const numbers = [...Array<number>(10)].map((_, index) => index + 48);
    const upperCaseA2Z = [...Array<number>(26)].map((_, index) => index + 65);
    const lowerCaseA2Z = [...Array<number>(26)].map((_, index) => index + 97);

    // Make test data with printable numbers and letters
    const data = new Uint8Array([...numbers, ...upperCaseA2Z, ...lowerCaseA2Z]);
    dataStore = new DataStore("test.file", "test-file", data);
  });

  beforeEach(() => {
    store = new ApplicationStore(dataStore);
    render(<HexView store={store} bytesPerRow={16} />);
  });

  test("must have scroll buttons", () => {
    expect(screen.getByRole("button", { name: /scroll to top/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /scroll to bottom/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /go to offset/i })).toBeInTheDocument();
  });

  test("must have horizontal header elements", () => {
    const values = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0A", "0B", "0C", "0D", "0E", "0F"];
    const headerElements = screen.getAllByText(
      (content, element) =>
        element?.tagName.toLowerCase() === "span" && values.includes(content) && content.length === 2
    );
    expect(headerElements).toHaveLength(16);
  });

  test("must have vertical offset header elements", () => {
    const values = ["000000", "000010", "000020", "000030"];
    const headerElements = screen.getAllByText(
      (content, element) =>
        element?.tagName.toLowerCase() === "span" && values.includes(content) && content.length === 6
    );
    expect(headerElements).toHaveLength(4);
  });

  test("must have default selection", () => {
    expect(store.selectionStore.currentSelection).toMatchObject({ from: 0, to: 0 });

    // First byte with value 0x30 (48 - '0') is selected
    expect(screen.getByText("30")).toHaveClass("ByteSelected");

    // First ASCII byte with value '0' is also selected
    expect(screen.getByText("0")).toHaveClass("ByteSelected");
  });

  test("must select a range of bytes with shift-click", () => {
    const eighthByte = screen.getByText("37");
    userEvent.click(eighthByte, { shiftKey: true });

    expect(store.selectionStore.currentSelection).toMatchObject({ from: 0, to: 7 });
  });

  test("must select the correct bytes in case of reverse selection with shift-click", () => {
    // Click on eighth byte then the first byte (reverse selection)
    userEvent.click(screen.getByText("37"));
    userEvent.click(screen.getByText("30"), { shiftKey: true });

    expect(store.selectionStore.currentSelection).toMatchObject({ from: 0, to: 7 });
  });

  test.todo("must scroll to top");
  test.todo("must scroll to bottom");
});
