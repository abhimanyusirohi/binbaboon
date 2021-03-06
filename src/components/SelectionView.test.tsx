import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SelectionView } from "./SelectionView";
import { SelectionStore } from "../SelectionStore";
import { Selection } from "../Selection";

// Mock the clipboard's writeText method
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn()
  }
});

describe("SelectionView", () => {
  let store: SelectionStore;

  beforeEach(() => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 65, 66]);
    store = new SelectionStore(data);
    render(<SelectionView store={store} />);
  });

  test("must default to big endian", () => {
    expect(screen.getByRole("button", { name: /Big endian/i, pressed: true })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Little endian/i, pressed: false })).toBeInTheDocument();
  });

  test.each`
    fromOffset | toOffset | expectedInfo                  | expectedHex
    ${0}       | ${0}     | ${"1 byte selected (0 ➔ 0)"}  | ${"01"}
    ${0}       | ${1}     | ${"2 bytes selected (0 ➔ 1)"} | ${"01 02"}
    ${0}       | ${2}     | ${"3 bytes selected (0 ➔ 2)"} | ${"01 02 03"}
    ${0}       | ${3}     | ${"4 bytes selected (0 ➔ 3)"} | ${"01 02 03 04"}
    ${0}       | ${4}     | ${"5 bytes selected (0 ➔ 4)"} | ${"01 02 03 04 05"}
    ${0}       | ${5}     | ${"6 bytes selected (0 ➔ 5)"} | ${"01 02 03 04 05 06"}
    ${0}       | ${6}     | ${"7 bytes selected (0 ➔ 6)"} | ${"01 02 03 04 05 06 07"}
    ${0}       | ${7}     | ${"8 bytes selected (0 ➔ 7)"} | ${"01 02 03 04 05 06 07 08"}
    ${0}       | ${8}     | ${"9 bytes selected (0 ➔ 8)"} | ${"01 02 03 04 05 06 07 08 41"}
  `(
    "must display correct text for selection $fromOffset to $toOffset",
    ({ fromOffset, toOffset, expectedInfo, expectedHex }) => {
      store.setSelection(new Selection(fromOffset, toOffset));

      expect(screen.getByText(expectedInfo)).toBeInTheDocument();
      expect(screen.getByTestId("Hex-value")).toHaveTextContent(expectedHex);
    }
  );

  test.each`
    fromOffset | toOffset | expectedInt            | expectedUInt           | expectedBinary
    ${0}       | ${0}     | ${"1"}                 | ${"1"}                 | ${"00000001"}
    ${0}       | ${1}     | ${"258"}               | ${"258"}               | ${"00000001 00000010"}
    ${0}       | ${2}     | ${"197121"}            | ${"197121"}            | ${"00000000 00000001 00000010 00000011"}
    ${0}       | ${3}     | ${"16909060"}          | ${"16909060"}          | ${"00000001 00000010 00000011 00000100"}
    ${0}       | ${4}     | ${"67305989"}          | ${"67305989"}          | ${"00000000 00000000 00000000 00000001 00000010 00000011 00000100 00000101"}
    ${0}       | ${5}     | ${"67307013"}          | ${"67307013"}          | ${"00000000 00000000 00000001 00000010 00000011 00000100 00000101 00000110"}
    ${0}       | ${6}     | ${"67569157"}          | ${"67569157"}          | ${"00000000 00000001 00000010 00000011 00000100 00000101 00000110 00000111"}
    ${0}       | ${7}     | ${"72623859790382850"} | ${"72623859790382850"} | ${"00000001 00000010 00000011 00000100 00000101 00000110 00000111 00001000"}
    ${0}       | ${8}     | ${"-"}                 | ${"-"}                 | ${"-"}
  `(
    "must display correct big-endian values for selection $fromOffset to $toOffset",
    ({ fromOffset, toOffset, expectedInt, expectedUInt, expectedBinary }) => {
      store.setSelection(new Selection(fromOffset, toOffset));

      let bitsCount: number | string = (toOffset - fromOffset + 1) * 8;
      bitsCount = bitsCount <= 64 ? bitsCount : "";
      expect(screen.getByTestId(`Int${bitsCount}-value`)).toHaveTextContent(expectedInt);
      expect(screen.getByTestId(`UInt${bitsCount}-value`)).toHaveTextContent(expectedUInt);
      expect(screen.getByTestId(`Binary-value`)).toHaveTextContent(expectedBinary);
    }
  );

  test.each`
    fromOffset | toOffset | expectedInt             | expectedUInt            | expectedBinary
    ${0}       | ${0}     | ${"1"}                  | ${"1"}                  | ${"00000001"}
    ${0}       | ${1}     | ${"513"}                | ${"513"}                | ${"00000010 00000001"}
    ${0}       | ${2}     | ${"66051"}              | ${"66051"}              | ${"00000011 00000010 00000001 00000000"}
    ${0}       | ${3}     | ${"67305985"}           | ${"67305985"}           | ${"00000100 00000011 00000010 00000001"}
    ${0}       | ${4}     | ${"33752069"}           | ${"33752069"}           | ${"00000101 00000100 00000011 00000010 00000001 00000000 00000000 00000000"}
    ${0}       | ${5}     | ${"50595078"}           | ${"50595078"}           | ${"00000110 00000101 00000100 00000011 00000010 00000001 00000000 00000000"}
    ${0}       | ${6}     | ${"67438087"}           | ${"67438087"}           | ${"00000111 00000110 00000101 00000100 00000011 00000010 00000001 00000000"}
    ${0}       | ${7}     | ${"578437695752307200"} | ${"578437695752307200"} | ${"00001000 00000111 00000110 00000101 00000100 00000011 00000010 00000001"}
    ${0}       | ${8}     | ${"-"}                  | ${"-"}                  | ${"-"}
  `(
    "must display correct little-endian values for selection $fromOffset to $toOffset",
    ({ fromOffset, toOffset, expectedInt, expectedUInt, expectedBinary }) => {
      store.setSelection(new Selection(fromOffset, toOffset));

      const leButton = screen.getByRole("button", { name: /Little endian/i });
      userEvent.click(leButton);

      let bitsCount: number | string = (toOffset - fromOffset + 1) * 8;
      bitsCount = bitsCount <= 64 ? bitsCount : "";
      expect(screen.getByTestId(`Int${bitsCount}-value`)).toHaveTextContent(expectedInt);
      expect(screen.getByTestId(`UInt${bitsCount}-value`)).toHaveTextContent(expectedUInt);
      expect(screen.getByTestId(`Binary-value`)).toHaveTextContent(expectedBinary);
    }
  );

  describe("copy", () => {
    beforeAll(() => {
      jest.spyOn(navigator.clipboard, "writeText");
    });

    beforeEach(() => {
      store.setSelection(new Selection(0, 3));
    });

    test("must copy hex string to the clipboard", () => {
      userEvent.click(screen.getByTestId("Hex-copy"));
      expect(navigator.clipboard.writeText).toBeCalledWith("01 02 03 04");
    });

    test("must copy integer value to the clipboard", () => {
      userEvent.click(screen.getByTestId("Int32-copy"));
      expect(navigator.clipboard.writeText).toBeCalledWith("16909060");
    });

    test("must copy unsigned integer value to the clipboard", () => {
      userEvent.click(screen.getByTestId("UInt32-copy"));
      expect(navigator.clipboard.writeText).toBeCalledWith("16909060");
    });

    test("must copy binary value to the clipboard", () => {
      userEvent.click(screen.getByTestId("Binary-copy"));
      expect(navigator.clipboard.writeText).toBeCalledWith("00000001 00000010 00000011 00000100");
    });

    test("must copy bytes to the clipboard", () => {
      userEvent.click(screen.getByRole("button", { name: /Copy Bytes/i }));
      expect(navigator.clipboard.writeText).toBeCalledWith(String.fromCharCode(1, 2, 3, 4));
    });
  });

  describe("go to offset", () => {
    test("must display goto-offset button when selected byte value is a valid offset", () => {
      store.setSelection(new Selection(0, 0));

      // First byte has a value of 1 which is a valid offset (0-9)
      expect(screen.getByTestId("Int8-goto")).toBeInTheDocument();
      expect(screen.getByTestId("UInt8-goto")).toBeInTheDocument();
    });

    test("must not display goto-offset button when selected byte value is not a valid offset", () => {
      store.setSelection(new Selection(8, 8));

      // Eighth byte has a value of 65 which is not a valid offset
      expect(screen.queryByTestId("Int8-goto")).toBeNull();
      expect(screen.queryByTestId("UInt8-goto")).toBeNull();
    });

    test("must go to offset from Int", () => {
      store.setSelection(new Selection(0, 0));

      userEvent.click(screen.getByTestId("Int8-goto"));
      expect(store.currentSelection).toMatchObject({ from: 1, to: 1 });
    });

    test("must go to offset from UInt", () => {
      store.setSelection(new Selection(0, 0));

      userEvent.click(screen.getByTestId("UInt8-goto"));
      expect(store.currentSelection).toMatchObject({ from: 1, to: 1 });
    });
  });

  test.todo("must display notification on copy");
});
