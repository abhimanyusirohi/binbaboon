import { render, screen } from "@testing-library/react";
import { SelectionViewer } from "./SelectionViewer";
import { SelectionStore } from "../stores/SelectionStore";
import { Selection } from "../stores/Selection";

describe("SelectionViewer", () => {
  test("single selection", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    const store = new SelectionStore(data);
    render(<SelectionViewer store={store} />);

    store.setSelection(new Selection(0, 0));

    expect(screen.getByRole("button", { name: /Little endian/i })).toBeInTheDocument();
  });
});
