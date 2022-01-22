import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";

import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import { blue } from "@mui/material/colors";

import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarksIcon from "@mui/icons-material/BookmarksOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/HelpOutline";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

import { Bookmark } from "../stores/BookmarkCollection";
import { BookmarkStore } from "../stores/BookmarkStore";
import { SelectionStore } from "../stores/SelectionStore";

/**
 * TODOs
 * Top: Search, Expand All, Collapse All
 * Select a bookmark should select in hexviewer.
 *    BookmarkViewer sets selectedBookmark which sets the selection which shows in HexViewer
 * Delete bookmark - delete icon on same row
 */

export interface BookmarkViewerProps {
  bookmarkStore: BookmarkStore;
  selectionStore: SelectionStore;
}

export const BookmarkViewer: React.FunctionComponent<BookmarkViewerProps> = observer(
  ({ bookmarkStore, selectionStore }) => {
    const [expanded, setExpanded] = useState<string[]>([]);
    const [selected, setSelected] = useState<string>("");

    useEffect(() => {
      // Select and make the selected bookmark visible by expanding its parent
      if (bookmarkStore.selectedBookmark) {
        let selectedNode = "";
        const expandedNodes = expanded;
        selectedNode = bookmarkStore.selectedBookmark.name;
        if (bookmarkStore.selectedBookmark.parent) {
          expandedNodes.push(bookmarkStore.selectedBookmark.parent.name);
        }

        // Batch updates to avoid multiple renders
        setSelected(selectedNode);
        setExpanded(expandedNodes);
      }
    }, [bookmarkStore.selectedBookmark]);

    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
      setExpanded(nodeIds);
    };

    const handleSelect = (event: React.SyntheticEvent, nodeIds: string[] | string) => {
      setSelected(nodeIds as string);

      const bookmark = bookmarkStore.bookmarkCollection.find(nodeIds as string);
      if (bookmark) {
        selectionStore.setSelection(bookmark.selection);
        selectionStore.scrollToSelection();
      }
    };

    // Removes the extra padding that makes the item overlap the container
    const StyledTreeItem = styled(TreeItem)`
      .MuiTreeItem-content {
        padding-left: 0px;
        padding-right: 0px;
      }

      .MuiTreeItem-label {
        padding-left: 0px;
      }
    `;

    // Renders the bookmark hierarchy
    const renderTree = (bookmarks: Bookmark[]) =>
      bookmarks.map((bookmark) => (
        <StyledTreeItem
          key={bookmark.name}
          nodeId={bookmark.name}
          label={
            <CustomTreeItem
              bookmark={bookmark}
              onDelete={() => bookmarkStore.bookmarkCollection.delete(bookmark.name)}
            />
          }
        >
          {renderTree(bookmark.children.bookmarks)}
        </StyledTreeItem>
      ));

    return (
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }} aria-label="bookmarks">
              <BookmarkIcon />
            </Avatar>
          }
          title="Bookmarks"
          subheader="Make bytes meaningful by adding bookmarks"
        />
        <CardContent sx={{ overflow: "auto" }}>
          {bookmarkStore.bookmarkCount > 0 && (
            <TreeView
              defaultCollapseIcon={<ExpandMoreIcon />}
              defaultExpandIcon={<ChevronRightIcon />}
              expanded={expanded}
              selected={selected}
              onNodeToggle={handleToggle}
              onNodeSelect={handleSelect}
              sx={{ height: 500 }}
            >
              {renderTree(bookmarkStore.bookmarkCollection.bookmarks)}
            </TreeView>
          )}
        </CardContent>
      </Card>
    );
  }
);

interface CustomTreeItemProps {
  bookmark: Bookmark;
  onDelete: React.MouseEventHandler;
}

/**
 * A customised TreeItem component that displays additional buttons for each item
 */
const CustomTreeItem: React.FunctionComponent<CustomTreeItemProps> = ({ bookmark, onDelete }) => {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  const description = bookmark.description && `${bookmark.description}\n`;
  const helpText = `${description}(${bookmark.selection.size} bytes)`;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box component={bookmark.children.hasBookmarks ? BookmarksIcon : BookmarkIcon} color="inherit" />
      <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1 }}>
        {bookmark.name}
      </Typography>
      <Tooltip title={helpText} arrow>
        <HelpIcon fontSize="inherit" />
      </Tooltip>
      <Tooltip title="Delete" arrow>
        <IconButton size="small" color="inherit" onClick={handleDeleteClick}>
          <DeleteIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};
