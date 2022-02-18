import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import { AddBookmarkDialog } from "./AddBookmarkDialog";
import { BookmarkView } from "./BookmarkView";
import { SelectionView } from "./SelectionView";
import { GoToOffsetDialog } from "./GoToOffsetDialog";
import { HexView } from "./HexView";
import { AlertDialog } from "./AlertDialog";
import { MainToolbar } from "./MainToolbar";
import { SearchView } from "./SearchView";

import { ApplicationStore } from "../ApplicationStore";

export interface AppProps {
  store: ApplicationStore;
  onClose: SimpleCallback;
}

export const App: React.FunctionComponent<AppProps> = observer(({ store, onClose }) => {
  const [addBookmarkDialogShown, showAddBookmarkDialog] = useState<boolean>(false);
  const [openFormatAlertDialog, showOpenFormatAlertDialog] = useState<boolean>(false);
  const [goToOffsetDialogShown, showGoToOffsetDialog] = useState<boolean>(false);

  const onToolbarCommand = (commandId: string): void => {
    switch (commandId) {
      case "binbaboon.file.close":
        onClose();
        break;

      case "binbaboon.bookmark.add":
        showAddBookmarkDialog(true);
        break;

      case "binbaboon.selection.gotooffset":
        showGoToOffsetDialog(true);
        break;
    }
  };

  const handleAlertDialog = (result: string) => {
    showOpenFormatAlertDialog(false);

    if (result === "Open") {
      // const records = store.formatDefinitionStore.readFile();
      // store.bookmarkStore.addBookmarksForRecords(records);
    }
  };

  return (
    <Box>
      <Grid container spacing={1} padding={1}>
        <Grid item xs={12}>
          <MainToolbar store={store} onCommand={onToolbarCommand} />
        </Grid>
        <Grid item lg={3}>
          <BookmarkView bookmarkStore={store.bookmarkStore} selectionStore={store.selectionStore} />
        </Grid>
        <Grid item lg={6}>
          <HexView store={store} />
        </Grid>
        <Grid item lg={3}>
          <Stack direction="column" spacing={1}>
            <SelectionView store={store.selectionStore} />
            <SearchView fileStore={store.fileStore} selectionStore={store.selectionStore} />
          </Stack>
        </Grid>
      </Grid>
      {addBookmarkDialogShown && (
        <AddBookmarkDialog
          store={store.bookmarkStore}
          selection={store.selectionStore.currentSelection}
          onClose={() => showAddBookmarkDialog(false)}
        />
      )}
      {openFormatAlertDialog && (
        <AlertDialog
          title="Open using format definition"
          infoText="Format definition is available for this file. A format definition tags raw bytes as records and fields.\nDo you want to open this file using the available format definition?"
          buttonText={["Close", "Open"]}
          onClose={handleAlertDialog}
        />
      )}
      {goToOffsetDialogShown && <GoToOffsetDialog store={store} onClose={() => showGoToOffsetDialog(false)} />}
    </Box>
  );
});
