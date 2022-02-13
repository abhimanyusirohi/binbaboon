import React from "react";
import { observer } from "mobx-react-lite";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import ArticleIcon from "@mui/icons-material/ArticleOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import ForwardIcon from "@mui/icons-material/ForwardOutlined";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAddOutlined";

import { ApplicationStore } from "../ApplicationStore";

export interface MainToolbarProps {
  store: ApplicationStore;
  onCommand: (commandId: string) => void;
}

export const MainToolbar: React.FunctionComponent<MainToolbarProps> = observer(({ store, onCommand }) => {
  return (
    <AppBar position="static" color="primary">
      <Toolbar variant="regular">
        <ArticleIcon fontSize="large" />
        <Box display="block" sx={{ flexGrow: 1, ml: 2 }}>
          <Typography variant="h6" display="block">
            {store.fileStore.name}
          </Typography>
          <Typography variant="caption" display="block">{`${store.fileStore.size} bytes`}</Typography>
        </Box>

        <Tooltip title="Add bookmark" arrow>
          <IconButton size="large" color="inherit" onClick={() => onCommand("binbaboon.bookmark.add")}>
            <BookmarkAddIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Go to offset" arrow>
          <IconButton size="large" color="inherit" onClick={() => onCommand("binbaboon.selection.gotooffset")}>
            <ForwardIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Close this file" arrow>
          <Button
            variant="contained"
            color="warning"
            startIcon={<CloseIcon />}
            onClick={() => onCommand("binbaboon.file.close")}
          >
            Close
          </Button>
        </Tooltip>
      </Toolbar>
    </AppBar>
  );
});
