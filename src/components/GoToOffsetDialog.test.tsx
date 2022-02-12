import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";

import { GoToOffsetDialog } from "./GoToOffsetDialog";
import { ApplicationStore } from "../stores/ApplicationStore";
import { Selection } from "../stores/Selection";
import { FileStore } from "../stores/FileStore";

describe("GoToOffsetDialog", () => {
  let store: ApplicationStore;
  const closeHandler = jest.fn();

  beforeEach(() => {
    const data = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    const fileStore = new FileStore("test.file", "text-file", data);
    store = new ApplicationStore(fileStore);

    store.selectionStore.setSelection(new Selection(1, 3));
    render(<GoToOffsetDialog store={store} onClose={closeHandler} />);
  });

  test("must show the current selection's starting offset by default", () => {
    expect(screen.getByRole("textbox", { name: /Offset/i })).toHaveValue("1");
  });

  test("must show correct information text", () => {
    expect(screen.getByText("Specify an offset value between 0 and 15")).toBeInTheDocument();
  });

  test("must show error message when offset is too large", () => {
    expect(screen.queryByText("Invalid offset value")).toBeNull();

    const textbox = screen.getByRole("textbox", { name: /Offset/i });
    expect(textbox).toHaveValue("1");

    userEvent.type(textbox, "100");

    expect(textbox).toHaveValue("100");
    expect(screen.getByText("Invalid offset value")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Go/i })).toBeDisabled();
  });

  test("must call onClose when close button is clicked", () => {
    const closeButton = screen.getByRole("button", { name: /Close/i });

    userEvent.click(closeButton);

    expect(closeHandler).toBeCalledTimes(1);
  });

  test("must change selection when go button is clicked", () => {
    expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 1, toOffset: 3 });

    const textbox = screen.getByRole("textbox", { name: /Offset/i });
    const goButton = screen.getByRole("button", { name: /Go/i });

    userEvent.type(textbox, "8");
    userEvent.click(goButton);

    expect(store.selectionStore.currentSelection).toMatchObject({ fromOffset: 8, toOffset: 8 });
  });

  test.todo("must only accept integer values");
});
