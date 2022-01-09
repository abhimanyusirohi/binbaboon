import { Selection } from "./Selection";
import { SelectionStore } from "./SelectionStore";

describe("SelectionStore", () => {
  test("selected data must return correct data for selection", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    const store = new SelectionStore(data);

    store.setSelection(new Selection(0, 3));
    expect(areUint8ArraysEqual(store.selectedData, new Uint8Array([1, 2, 3, 4]))).toBeTruthy();
  });

  test("selected data must return correct data for reverse selection", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    const store = new SelectionStore(data);

    store.setSelection(new Selection(3, 0));
    expect(areUint8ArraysEqual(store.selectedData, new Uint8Array([1, 2, 3, 4]))).toBeTruthy();
  });
});

/**
 * Checks if the given arrays are equal
 */
function areUint8ArraysEqual(a: Uint8Array, b: Uint8Array) {
  if (a.byteLength != b.byteLength) {
    return false;
  }

  return a.every((val, i) => val == b[i]);
}
