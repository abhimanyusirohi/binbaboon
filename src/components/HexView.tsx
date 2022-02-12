import React, { CSSProperties, useEffect, useRef, useState } from "react";
import { FixedSizeList } from "react-window";
import classNames from "classnames";

import { ApplicationStore } from "../stores/ApplicationStore";
import { Selection } from "../stores/Selection";

import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";

import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ScrollToTopIcon from "@mui/icons-material/FirstPageOutlined";
import ScrollToBottomIcon from "@mui/icons-material/LastPageOutlined";

import { observer } from "mobx-react-lite";

import "./HexView.css";
import { SelectionStore } from "../stores/SelectionStore";

type ByteMouseEvent = (event: React.MouseEvent, offset: number) => void;

export interface HexViewProps {
  store: ApplicationStore;
  bytesPerRow?: number;
}

export const HexView: React.FunctionComponent<HexViewProps> = observer(({ store, bytesPerRow = 16 }) => {
  const gridRef = useRef<FixedSizeList>(null);
  const mouseDraggedFromOffset = useRef<number | null>(null);

  const [rows, setRows] = useState<Uint8Array[]>([]);
  const [windowSize, setWindowSize] = useState({
    x: window.innerWidth,
    y: window.innerHeight
  });

  const updateSize = () =>
    setWindowSize({
      x: window.innerWidth,
      y: window.innerHeight
    });

  useEffect(() => (window.onresize = updateSize), []);

  // Called once on startup to break the data into fixed size rows
  useEffect(() => {
    const rows = [];
    const data = store.fileStore.data;
    for (let offset = 0; offset < data.length; ) {
      const rowData = data.slice(offset, offset + bytesPerRow);
      rows.push(rowData);
      offset += bytesPerRow;
    }

    setRows(rows);
  }, []);

  // Called once on startup and then whenever the scroll-to-selection changes
  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.scrollToItem(store.selectionStore.currentSelection.fromOffset / bytesPerRow, "center");
    }
  }, [store.selectionStore.scrollToSelectionSignal]);

  // Called when mouse down event is fired for one of the bytes
  const onByteMouseEvent: ByteMouseEvent = (event: React.MouseEvent, offset: number) => {
    switch (event.type) {
      case "mousedown":
        // Only select on left click
        if (event.button !== 0) {
          return;
        }

        // Shift-click to select a range
        if (event.shiftKey) {
          store.selectionStore.setSelection(new Selection(store.selectionStore.currentSelection.fromOffset, offset));
          return;
        }

        mouseDraggedFromOffset.current = offset;
        store.selectionStore.setSelection(new Selection(mouseDraggedFromOffset.current, offset));
        break;

      case "mouseup":
        mouseDraggedFromOffset.current = null;
        break;

      case "mousemove":
        if (mouseDraggedFromOffset.current !== null) {
          store.selectionStore.setSelection(new Selection(mouseDraggedFromOffset.current, offset));
        }
        break;
    }
  };

  const scrollToTop = (): void => {
    gridRef.current?.scrollToItem(0, "start");
  };

  const scrollToBottom = (): void => {
    gridRef.current?.scrollToItem(rows.length - 1, "end");
  };

  const itemSize = 0.015 * windowSize.x;
  return (
    <Paper elevation={2}>
      <HexViewHeaderRow count={bytesPerRow} onScrollTop={scrollToTop} onScrollBottom={scrollToBottom} />
      <FixedSizeList
        ref={gridRef}
        height={0.85 * windowSize.y}
        itemCount={rows.length}
        itemSize={itemSize}
        itemData={{
          rows,
          bytesPerRow,
          store,
          onMouseEvent: onByteMouseEvent
        }}
        width={"100%"}
        layout="vertical"
        className="NoTextSelect p-0"
      >
        {FixedSizeListRow}
      </FixedSizeList>
    </Paper>
  );
});

interface FixedSizeListRowProps {
  data: {
    rows: Uint8Array[];
    bytesPerRow: number;
    store: ApplicationStore;
    onMouseEvent: ByteMouseEvent;
  };
  index: number;
  style: CSSProperties;
}

/**
 * Row component used the FixedSizeList component
 * "data", "index" and "style" are passed to this component by FixedSizeList
 */
const FixedSizeListRow: React.FunctionComponent<FixedSizeListRowProps> = observer(
  ({ data, index: rowIndex, style }) => {
    const rowData = data.rows[rowIndex];
    const rowOffset = data.bytesPerRow * rowIndex;

    const rowHasBookmarks =
      data.store.bookmarkStore.bookmarkCollection.findByOffsetRange(rowOffset, rowOffset + data.bytesPerRow - 1)
        .length > 0;

    return (
      <Grid container style={style} columns={16} flexWrap="nowrap" alignItems="center">
        <Grid item lg={1} display="flex" alignItems="center" justifyContent="center">
          {rowHasBookmarks && <BookmarkIcon className="Rotated90Clockwise" />}
        </Grid>
        <Grid item xs={2} display="flex" alignItems="center" justifyContent="center">
          <Tooltip title={rowOffset} arrow>
            <span>{rowOffset.toString(16).padStart(6, "0").toUpperCase()}</span>
          </Tooltip>
        </Grid>
        <Grid item lg={9}>
          <RawByteSequence
            data={rowData}
            dataOffset={rowOffset}
            selectionStore={data.store.selectionStore}
            onMouseEvent={data.onMouseEvent}
          />
        </Grid>
        <Grid item lg={4}>
          <ASCIIDataSequence
            data={rowData}
            dataOffset={rowOffset}
            selectionStore={data.store.selectionStore}
            onMouseEvent={data.onMouseEvent}
          />
        </Grid>
      </Grid>
    );
  }
);

interface RawByteSequenceProps {
  data: Uint8Array;
  dataOffset: number;
  selectionStore: SelectionStore;
  onMouseEvent: ByteMouseEvent;
}

/**
 * Component that represents a sequence of raw byte values
 */
const RawByteSequence: React.FunctionComponent<RawByteSequenceProps> = observer(
  ({ data, dataOffset, selectionStore, onMouseEvent }) => {
    return (
      <>
        {Array.from(data).map((value, index) => (
          <span
            key={`byte-${dataOffset}-${index}`}
            className={classNames(
              "Byte",
              { ByteSelected: selectionStore.currentSelection.containsOffset(dataOffset + index) },
              { ByteSequenceDividerMargin: index === 8 }
            )}
            onMouseDown={(e) => onMouseEvent(e, dataOffset + index)}
            onMouseUp={(e) => onMouseEvent(e, dataOffset + index)}
            onMouseMove={(e) => onMouseEvent(e, dataOffset + index)}
          >
            {value.toString(16).toUpperCase().padStart(2, "0")}
          </span>
        ))}
      </>
    );
  }
);

interface ASCIIDataSequenceProps {
  data: Uint8Array;
  dataOffset: number;
  selectionStore: SelectionStore;
  onMouseEvent: ByteMouseEvent;
}

/**
 * Component that represents a sequence of ASCII characters
 */
const ASCIIDataSequence: React.FunctionComponent<ASCIIDataSequenceProps> = observer(
  ({ data, dataOffset, selectionStore, onMouseEvent }) => {
    return (
      <>
        {Array.from(data).map((value, index) => (
          <span
            key={`ascii-${dataOffset}-${index}`}
            className={classNames("Byte Ascii", {
              ByteSelected: selectionStore.currentSelection.containsOffset(dataOffset + index)
            })}
            onMouseDown={(e) => onMouseEvent(e, dataOffset + index)}
            onMouseUp={(e) => onMouseEvent(e, dataOffset + index)}
            onMouseMove={(e) => onMouseEvent(e, dataOffset + index)}
          >
            {value < 33 ? "•" : String.fromCharCode(value)}
          </span>
        ))}
      </>
    );
  }
);

interface HexViewHeaderRowProps {
  count: number;
  onScrollTop: SimpleCallback;
  onScrollBottom: SimpleCallback;
}

/**
 * Component that represents the non-clickable header of the view
 */
const HexViewHeaderRow: React.FunctionComponent<HexViewHeaderRowProps> = ({ count, onScrollTop, onScrollBottom }) => {
  // Make sequence of values
  const headerValues = [...Array<number>(count)].map((_, index) => index);
  const bytes = headerValues.map((value, index) => (
    <span key={index} className={classNames("Byte", "HeaderByte", { ByteSequenceDividerMargin: index === 8 })}>
      {value.toString(16).toUpperCase().padStart(2, "0")}
    </span>
  ));

  return (
    <Grid container className="NoTextSelect HeaderRow" columns={16}>
      <Grid item lg={1} />
      <Grid item lg={2} />
      <Grid item lg={9}>
        {bytes}
      </Grid>
      <Grid item lg={4}>
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title="Scroll to top" arrow>
            <IconButton size="small" color="inherit" onClick={onScrollTop}>
              <ScrollToTopIcon fontSize="inherit" className="Rotated90Clockwise" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Scroll to bottom" arrow>
            <IconButton size="small" color="inherit" onClick={onScrollBottom}>
              <ScrollToBottomIcon fontSize="inherit" className="Rotated90Clockwise" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Grid>
    </Grid>
  );
};
