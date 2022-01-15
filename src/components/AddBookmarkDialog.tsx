import React, { ChangeEvent, useState } from "react";

import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import { Selection } from "../stores/Selection";
import { BookmarkStore } from "../stores/BookmarkStore";

export interface AddBookmarkDialogProps {
  store: BookmarkStore;
  selection: Selection;
  onClose: () => void;
}

export const AddBookmarkDialog: React.FunctionComponent<AddBookmarkDialogProps> = ({ store, selection, onClose }) => {
  const [bookmarkName, setBookmarkName] = useState<string>("");
  const [bookmarkDescription, setBookmarkDescription] = useState<string>("");
  const [errorText, setErrorText] = useState<string>("");

  const bookmarkNameChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setBookmarkName(e.target.value);
    setErrorText("");
  };

  const addBookmark = () => {
    try {
      store.bookmarkCollection.add(bookmarkName, bookmarkDescription, selection);
      store.selectBookmark(bookmarkName);

      onClose();
    } catch (err) {
      if (err instanceof Error) {
        setErrorText(err.message);
      }
    }
  };

  return (
    <Dialog open={true} onClose={onClose} aria-labelledby="form-dialog-title">
      <DialogTitle id="form-dialog-title">Add Bookmark</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`A bookmark will be created for data from zero-based offset [${selection.fromOffset}] to offset [${selection.toOffset}]`}
        </DialogContentText>
        <TextField
          id="name"
          label="Name"
          type="text"
          autoFocus={true}
          margin="dense"
          required={true}
          fullWidth={true}
          autoComplete="off"
          inputProps={{ maxLength: 1024 }}
          onChange={bookmarkNameChanged}
          error={errorText.length > 0}
          helperText={errorText}
          sx={{ marginTop: 2 }}
        />
        <TextField
          id="description"
          label="Description"
          type="text"
          margin="dense"
          fullWidth={true}
          inputProps={{ maxLength: 1024 }}
          onChange={(e) => setBookmarkDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
        <Button disabled={bookmarkName.length === 0} onClick={addBookmark} color="primary">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};
