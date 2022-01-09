import React from "react";
import { observer } from "mobx-react-lite";

import AppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";

import CloseIcon from "@mui/icons-material/CloseOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import ForwardIcon from "@mui/icons-material/ForwardOutlined";
import BookmarkAddIcon from "@mui/icons-material/BookmarkAddOutlined";

import Baboon from "../baboon.svg";

import { ApplicationStore } from "../stores/ApplicationStore";

export interface MainToolbarProps {
  store: ApplicationStore;
  onCommand: (commandId: string) => void;
}

export const MainToolbar: React.FunctionComponent<MainToolbarProps> = observer((props) => {
  return (
    <AppBar position="static" color="primary">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ marginLeft: 2 }}>
        <img alt="Baboon" src={Baboon} width={48} height={48} />
        <Toolbar variant="regular">
          <Tooltip title="Add bookmark" arrow>
            <IconButton size="large" color="inherit" onClick={() => props.onCommand("binbaboon.bookmark.add")}>
              <BookmarkAddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy" arrow>
            <IconButton size="large" color="inherit">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Go to offset" arrow>
            <IconButton size="large" color="inherit" onClick={() => props.onCommand("binbaboon.selection.gotooffset")}>
              <ForwardIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Search" arrow>
            <IconButton size="large" color="inherit">
              <SearchIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close this file" arrow>
            <Button
              variant="contained"
              color="warning"
              startIcon={<CloseIcon />}
              onClick={() => props.onCommand("binbaboon.file.close")}
            >
              Close
            </Button>
          </Tooltip>
        </Toolbar>
      </Stack>
    </AppBar>
  );
});
