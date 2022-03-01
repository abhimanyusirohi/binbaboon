import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import TreeItem from "@mui/lab/TreeItem";
import TreeView from "@mui/lab/TreeView";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";

import BookmarkIcon from "@mui/icons-material/BookmarkBorderOutlined";
import BookmarksIcon from "@mui/icons-material/BookmarksOutlined";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpIcon from "@mui/icons-material/HelpOutline";
import DeleteIcon from "@mui/icons-material/DeleteOutline";

import { Bookmark } from "../Bookmark";
import { BookmarkStore } from "../BookmarkStore";
import { SelectionStore } from "../SelectionStore";
import { ViewContainer } from "./ViewContainer";

/**
 * TODOs
 * Top: Search, Expand All, Collapse All
 */

export interface BookmarkViewProps {
  bookmarkStore: BookmarkStore;
  selectionStore: SelectionStore;
}

export const BookmarkView: React.FunctionComponent<BookmarkViewProps> = observer(
  ({ bookmarkStore, selectionStore }) => {
    const [expanded, setExpanded] = useState<string[]>([]);

    const handleToggle = (event: React.SyntheticEvent, nodeIds: string[]) => {
      setExpanded(nodeIds);
    };

    const handleSelect = (event: React.SyntheticEvent, nodeIds: string[] | string) => {
      bookmarkStore.selectBookmark(nodeIds as string);

      // Select the corresponding bytes when a bookmark is selected
      const bookmark = bookmarkStore.find(nodeIds as string);
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
          key={bookmark.id}
          nodeId={bookmark.id}
          label={<CustomTreeItem bookmark={bookmark} onDelete={() => bookmarkStore.delete(bookmark.id)} />}
        >
          {renderTree(bookmark.children)}
        </StyledTreeItem>
      ));

    const getExpandedNodes = (): string[] => {
      const expandedIds = new Set(expanded);

      // Expanded nodes are existing expanded nodes and all the parent
      // nodes of the selected bookmark to make it always visible
      let parentId = bookmarkStore.selectedBookmark?.parent;
      while (parentId && parentId !== null) {
        expandedIds.add(parentId);
        parentId = bookmarkStore.find(parentId)!.parent;
      }

      return [...expandedIds];
    };

    return (
      <ViewContainer icon={<BookmarkIcon />} title="Bookmarks" description="Make bytes meaningful by adding bookmarks">
        {bookmarkStore.count > 0 && (
          <TreeView
            defaultCollapseIcon={<ExpandMoreIcon />}
            defaultExpandIcon={<ChevronRightIcon />}
            expanded={getExpandedNodes()}
            selected={bookmarkStore.selectedBookmark !== null ? bookmarkStore.selectedBookmark.id : ""}
            onNodeSelect={handleSelect}
            onNodeToggle={handleToggle}
            sx={{ overflowY: "auto", minHeight: 240 }}
          >
            {renderTree(bookmarkStore.bookmarkTree)}
          </TreeView>
        )}
      </ViewContainer>
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
      {bookmark.children.length > 0 ? <BookmarksIcon fontSize="small" /> : <BookmarkIcon fontSize="small" />}
      <Typography variant="body2" sx={{ fontWeight: "inherit", flexGrow: 1, ml: 1, mr: 1 }} noWrap>
        {bookmark.name}
      </Typography>
      <Tooltip title={helpText} arrow>
        <HelpIcon fontSize="inherit" />
      </Tooltip>
      <IconButton size="small" color="inherit" onClick={handleDeleteClick}>
        <DeleteIcon fontSize="inherit" color="error" />
      </IconButton>
    </Box>
  );
};
