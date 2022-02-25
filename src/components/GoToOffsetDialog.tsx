import React, { useState } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { ApplicationStore } from "../ApplicationStore";
import { Selection } from "../Selection";

export interface GoToOffsetDialogProps {
  store: ApplicationStore;
  onClose: SimpleCallback;
}

export const GoToOffsetDialog: React.FunctionComponent<GoToOffsetDialogProps> = ({ store, onClose }) => {
  const [offset, setOffset] = useState<number>(store.selectionStore.currentSelection.fromOffset);

  const offsetValid = () => {
    return offset >= 0 && offset < store.dataStore.size;
  };

  const handleGoToOffset = () => {
    store.selectionStore.setSelection(new Selection(offset, offset));
    store.selectionStore.scrollToSelection();
    onClose();
  };

  return (
    <Dialog open={true} onClose={onClose}>
      <DialogTitle>Go To Offset</DialogTitle>
      <DialogContent>
        <DialogContentText>{`Specify an offset value between 0 and ${store.dataStore.size - 1}`}</DialogContentText>
        <TextField
          id="offset"
          label="Offset"
          type="text"
          autoFocus
          required
          fullWidth
          margin="dense"
          autoComplete="off"
          defaultValue={store.selectionStore.currentSelection.fromOffset}
          inputProps={{ maxLength: 10 }}
          onChange={(e) => setOffset(parseInt(e.target.value))}
          error={!offsetValid()}
          helperText={!offsetValid() && "Invalid offset value"}
          onKeyPress={(e) => {
            if (!/[0-9]/i.test(e.key)) {
              e.preventDefault();
            }
          }}
          onFocus={(e) => {
            e.target.select();
          }}
          sx={{ marginTop: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button disabled={!offsetValid()} onClick={handleGoToOffset}>
          Go
        </Button>
      </DialogActions>
    </Dialog>
  );
};
