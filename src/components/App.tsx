import React from "react";
import { observer } from "mobx-react-lite";

import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Fab from "@mui/material/Fab";

import CloseIcon from "@mui/icons-material/CloseOutlined";

import { BookmarkView } from "./BookmarkView";
import { SelectionView } from "./SelectionView";
import { HexView } from "./HexView";
import { FileInfoView } from "./FileInfoView";
import { SearchView } from "./SearchView";
import { ApplyDefinitionDialog } from "./ApplyDefinitionDialog";

import { ApplicationStore } from "../ApplicationStore";

export interface AppProps {
  store: ApplicationStore;
  onClose: SimpleCallback;
}

export const App: React.FunctionComponent<AppProps> = observer(({ store, onClose }) => {
  return (
    <>
      <Grid container spacing={1} padding={1}>
        <Grid item lg={3}>
          <Stack direction="column" spacing={1}>
            <FileInfoView store={store.dataStore} />
            <BookmarkView bookmarkStore={store.bookmarkStore} selectionStore={store.selectionStore} />
          </Stack>
        </Grid>
        <Grid item lg={6}>
          <HexView store={store} />
        </Grid>
        <Grid item lg={3}>
          <Stack direction="column" spacing={1}>
            <SelectionView store={store.selectionStore} />
            <SearchView dataStore={store.dataStore} selectionStore={store.selectionStore} />
          </Stack>
        </Grid>
      </Grid>
      <Fab
        color="error"
        size="small"
        aria-label="close"
        style={{ position: "absolute", top: 4, left: 4 }}
        onClick={onClose}
      >
        <CloseIcon />
      </Fab>
      {store.dataStore.hasFormatDefinition && (
        <ApplyDefinitionDialog dataStore={store.dataStore} bookmarkStore={store.bookmarkStore} />
      )}
    </>
  );
});
