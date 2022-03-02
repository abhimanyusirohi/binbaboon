import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import Link from "@mui/material/Link";

import { DataStore } from "../DataStore";
import { Selection } from "../Selection";
import { BookmarkStore } from "../BookmarkStore";
import { Bookmark } from "../Bookmark";
import { ByteOrder } from "../formatreader/FormatDefinition";

export interface ApplyDefinitionDialogProps {
  dataStore: DataStore;
  bookmarkStore: BookmarkStore;
}

export const ApplyDefinitionDialog: React.VoidFunctionComponent<ApplyDefinitionDialogProps> = observer(
  ({ dataStore, bookmarkStore }) => {
    const [shown, show] = useState<boolean>(dataStore.hasFormatDefinition);

    const applyDefinition = () => {
      try {
        const records = dataStore.applyFormatDefinition();

        let recordOffset = 0;
        records.forEach((record) => {
          const recordSelection = new Selection(recordOffset, recordOffset + record.size - 1);
          const recordBookmark = new Bookmark(record.definition.name, record.definition.description, recordSelection);
          bookmarkStore.add(recordBookmark);

          record.fields.forEach((field) => {
            const fieldSelection = new Selection(recordOffset, recordOffset + field.size - 1);
            const fieldBookmark = new Bookmark(field.definition.name, field.definition.description, fieldSelection);
            bookmarkStore.add(fieldBookmark);

            recordOffset += field.size;
          });
        });
      } catch (e) {
        console.log(e);
        //TODO: Show notification
      } finally {
        closeDialog();
      }
    };

    const closeDialog = () => {
      show(false);
    };

    const byteOrdering = dataStore.formatInfo.byteOrdering === ByteOrder.LittleEndian ? "Little endian" : "Big endian";
    return (
      <Dialog open={shown} maxWidth="sm" fullWidth>
        <DialogTitle>Apply Format Definition</DialogTitle>
        <DialogContent dividers>
          <Link
            variant="subtitle1"
            href={dataStore.formatInfo.specificationUrl}
            target="_blank"
            rel="noopener,noreferrer"
          >
            {dataStore.formatInfo.name}
          </Link>
          <DialogContentText variant="subtitle2">{dataStore.formatInfo.description}</DialogContentText>
          <DialogContentText variant="caption">{`${byteOrdering} byte ordering`}</DialogContentText>
          <DialogContentText marginTop={2}>
            A format definition is available for this format. Applying a definition will automatically create bookmarks
            for records
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={closeDialog}>
            Close
          </Button>
          <Button variant="contained" size="small" onClick={applyDefinition}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
);
