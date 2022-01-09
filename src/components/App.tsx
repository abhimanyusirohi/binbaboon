import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";

import { AddBookmarkDialog } from "./AddBookmarkDialog";
import { BookmarkViewer } from "./BookmarkViewer";
import { SelectionViewer } from "./SelectionViewer";
import { FileInfoViewer } from "./FileInfoViewer";
import { GoToOffsetDialog } from "./GoToOffsetDialog";
import { HexViewer } from "./HexViewer";
import { AlertDialog } from "./AlertDialog";
import { MainToolbar } from "./MainToolbar";

import { ApplicationStore } from "../stores/ApplicationStore";

export interface AppProps {
  applicationStore: ApplicationStore;
  onClose: () => void;
}

export const App: React.FunctionComponent<AppProps> = observer(({ applicationStore, onClose }) => {
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
      const records = applicationStore.formatDefinitionStore.readFile();
      applicationStore.bookmarkStore.addBookmarksForRecords(records);
    }
  };

  return (
    <Box>
      <Grid container spacing={1} padding={1}>
        <Grid item xs={12}>
          <MainToolbar store={applicationStore} onCommand={onToolbarCommand} />
        </Grid>
        <Grid item lg={3}>
          <Stack spacing={1}>
            <FileInfoViewer fileInfo={applicationStore.fileInfo} />
            <BookmarkViewer
              bookmarkStore={applicationStore.bookmarkStore}
              selectionStore={applicationStore.selectionStore}
            />
          </Stack>
        </Grid>
        <Grid item lg={6}>
          <HexViewer store={applicationStore} />
        </Grid>
        <Grid item lg={3}>
          <SelectionViewer store={applicationStore.selectionStore} />
        </Grid>
      </Grid>
      {addBookmarkDialogShown && (
        <AddBookmarkDialog
          currentSelection={applicationStore.selectionStore.currentSelection}
          bookmarkStore={applicationStore.bookmarkStore}
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
      {goToOffsetDialogShown && (
        <GoToOffsetDialog store={applicationStore} onClose={() => showGoToOffsetDialog(false)} />
      )}
    </Box>
  );
});
