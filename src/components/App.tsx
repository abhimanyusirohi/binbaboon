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
          <MultiViewContainer>
            <FileInfoView store={store.dataStore} />
            <BookmarkView bookmarkStore={store.bookmarkStore} selectionStore={store.selectionStore} />
          </MultiViewContainer>
        </Grid>
        <Grid item lg={6}>
          <HexView store={store} />
        </Grid>
        <Grid item lg={3}>
          <MultiViewContainer>
            <SelectionView store={store.selectionStore} />
            <SearchView dataStore={store.dataStore} selectionStore={store.selectionStore} />
          </MultiViewContainer>
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

/**
 * Contains multiple views
 * Sets full height on the last component
 */
const MultiViewContainer: React.FC = ({ children }) => {
  return (
    <Stack direction="column" spacing={1} sx={{ height: "100%" }}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child)) {
          const isLastChild = index === React.Children.count(children) - 1;
          return React.cloneElement(child, isLastChild ? { ...child.props, sx: { height: "100%" } } : child.props);
        }
      })}
    </Stack>
  );
};
