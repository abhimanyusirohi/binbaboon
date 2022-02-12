import React, { useEffect, useState } from "react";

import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Button from "@mui/material/Button";
import CardHeader from "@mui/material/CardHeader";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import OutlinedInput from "@mui/material/OutlinedInput";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItemButton from "@mui/material/ListItemButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import SvgIcon, { SvgIconProps } from "@mui/material/SvgIcon";
import Tooltip from "@mui/material/Tooltip";

import SearchIcon from "@mui/icons-material/SearchOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AbcIcon from "@mui/icons-material/AbcOutlined";
import ArrowCircleUpOutlinedIcon from "@mui/icons-material/ArrowCircleUpOutlined";
import ArrowCircleDownOutlinedIcon from "@mui/icons-material/ArrowCircleDownOutlined";

import { blue } from "@mui/material/colors";

import { Selection } from "../stores/Selection";
import { FileStore, FindOption, Match } from "../stores/FileStore";
import { SelectionStore } from "../stores/SelectionStore";

interface MatchWithText extends Match {
  text: string;
}

export interface SearchViewProps {
  fileStore: FileStore;
  selectionStore: SelectionStore;
  maximumMatches?: number;
}

export const SearchView: React.FunctionComponent<SearchViewProps> = ({
  fileStore,
  selectionStore,
  maximumMatches = 250
}) => {
  const [searchText, setSearchText] = useState<string>("");
  const [searchType, setSearchType] = useState<"text" | "hex">("text");
  const [ignoreCase, setIgnoreCase] = useState<boolean>(true);
  const [searchResults, setSearchResults] = useState<MatchWithText[] | null>(null);

  const handleSearch = async () => {
    let findOption = FindOption.Default;
    if (searchType === "hex") {
      findOption = FindOption.InterpretAsHex;
    } else if (ignoreCase) {
      findOption = FindOption.IgnoreCase;
    }

    const matches = fileStore.find(searchText, findOption, maximumMatches);

    // Convert matches from "find" to MatchWithText containing a text value that shows the matched data
    const matchesWithText = matches.map((match) => ({
      from: match.from,
      to: match.to,
      text: String.fromCharCode(...fileStore.data.slice(match.from, match.from + 32))
    }));
    setSearchResults(matchesWithText);
  };

  const toggleSearchType = () => {
    setSearchType(searchType === "text" ? "hex" : "text");
  };

  const toggleSearchCase = () => {
    setIgnoreCase(!ignoreCase);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const hideSearchResults = () => {
    setSearchResults(null);
  };

  const selectMatch = (match: Match) => {
    selectionStore.setSelection(new Selection(match.from, match.to));
    selectionStore.scrollToSelection();
  };

  return (
    <Accordion elevation={4} defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }}>
              <SearchIcon />
            </Avatar>
          }
          title="Search"
          subheader="Search for text or hex values"
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" alignItems="end" spacing={1}>
          <OutlinedInput
            type="text"
            fullWidth
            size="small"
            autoComplete="off"
            defaultValue={searchText}
            placeholder={searchType === "text" ? "Search text e.g. PDF" : "Search hex values e.g. FFF0"}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            startAdornment={<SearchTypeToggleButton checked={searchType === "hex"} onToggle={toggleSearchType} />}
            endAdornment={
              searchType === "text" && <SearchTextToggleCaseButton checked={!ignoreCase} onToggle={toggleSearchCase} />
            }
            inputProps={{ "aria-label": "Search" }}
          />
          <Button size="small" variant="contained" disabled={searchText.length === 0} onClick={handleSearch}>
            Search
          </Button>
          <SearchResultView
            matches={searchResults}
            maximumMatches={maximumMatches}
            onMatchSelect={selectMatch}
            onClose={hideSearchResults}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

interface SearchResultViewProps {
  matches: MatchWithText[] | null;
  maximumMatches: number;
  onMatchSelect: SingleParamCallback<Match>;
  onClose: SimpleCallback;
}

/**
 * Component that displays and allows browsing through the search results
 */
const SearchResultView: React.FunctionComponent<SearchResultViewProps> = ({
  matches,
  maximumMatches,
  onMatchSelect,
  onClose
}) => {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number>(0);

  const selectMatch = (index: number) => {
    setSelectedMatchIndex(index);
    onMatchSelect(matches![index]);
  };

  useEffect(() => {
    if (matches && matches?.length > 0) {
      selectMatch(0);
    }
  }, [matches]);

  return matches !== null ? (
    <Container disableGutters data-testid="search-results">
      <Divider>
        <Tooltip title={matches.length >= maximumMatches ? `First ${maximumMatches} matches only` : ""} arrow>
          <Chip
            variant="outlined"
            color={matches.length >= maximumMatches ? "warning" : "default"}
            label={`${matches.length} match${matches.length === 1 ? "" : "es"}`}
            onDelete={onClose}
          />
        </Tooltip>
      </Divider>
      {matches.length > 0 && (
        <React.Fragment>
          <Stack direction="row" justifyContent="space-between">
            <IconButton
              aria-label="Previous Match"
              onClick={() => selectMatch(selectedMatchIndex - 1)}
              disabled={selectedMatchIndex <= 0}
            >
              <ArrowCircleUpOutlinedIcon />
            </IconButton>
            <IconButton
              aria-label="Next Match"
              onClick={() => selectMatch(selectedMatchIndex + 1)}
              disabled={selectedMatchIndex >= matches.length - 1}
            >
              <ArrowCircleDownOutlinedIcon />
            </IconButton>
          </Stack>
          <List dense>
            {matches.slice(0, maximumMatches).map((match, index) => (
              <ListItemButton
                key={`item-${match.from}`}
                selected={index === selectedMatchIndex}
                onClick={() => selectMatch(index)}
              >
                <ListItemText primary={`${match.from}: ${match.text}`} />
              </ListItemButton>
            ))}
          </List>
        </React.Fragment>
      )}
    </Container>
  ) : (
    <React.Fragment />
  );
};

interface ToggleButtonProps {
  checked: boolean;
  onToggle: SimpleCallback;
}

/**
 * The toggle button inside the search textbox that toggles the search type (Text, Hex)
 */
const SearchTypeToggleButton: React.FunctionComponent<ToggleButtonProps> = ({ checked, onToggle }) => {
  return (
    <InputAdornment position="start">
      <Tooltip title="Toggle search type" arrow>
        <Checkbox
          checked={checked}
          size="small"
          icon={<AbcIcon color="primary" />}
          checkedIcon={<HexIcon color="primary" />}
          onClick={onToggle}
          inputProps={{ "aria-label": "Toggle Search Type" }}
        />
      </Tooltip>
    </InputAdornment>
  );
};

/**
 * The toggle button inside the search textbox that toggles the case-matching for text search
 */
const SearchTextToggleCaseButton: React.FunctionComponent<ToggleButtonProps> = ({ checked, onToggle }) => {
  return (
    <InputAdornment position="end">
      <Tooltip title="Toggle match case" arrow>
        <Checkbox
          checked={checked}
          size="small"
          icon={<TextCaseIcon />}
          checkedIcon={<TextCaseIcon color="primary" />}
          onClick={onToggle}
          inputProps={{ "aria-label": "Toggle Match Case" }}
        />
      </Tooltip>
    </InputAdornment>
  );
};

/**
 * The icon used to represent a hex value search
 */
const HexIcon: React.FunctionComponent<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        fill="currentColor"
        d="M7 7C5.9 7 5 7.9 5 9V15C5 16.11 5.9 17 7 17H9C10.11 17 11 16.11 11 15V9C11 7.9 10.11 7 9 7H7M7 9H9V15H7V9M17.6 17L15.5 14.9L13.4 17L12 15.6L14.1 13.5L12 11.4L13.4 10L15.5 12.1L17.6 10L19 11.4L16.9 13.5L19 15.6L17.6 17Z"
      />
    </SvgIcon>
  );
};

/**
 * The icon used to represent text case matching
 */
const TextCaseIcon: React.FunctionComponent<SvgIconProps> = (props) => {
  return (
    <SvgIcon {...props}>
      <path
        fill="currentColor"
        d="M20.06,18C20,17.83 19.91,17.54 19.86,17.11C19.19,17.81 18.38,18.16 17.45,18.16C16.62,18.16 15.93,17.92 15.4,17.45C14.87,17 14.6,16.39 14.6,15.66C14.6,14.78 14.93,14.1 15.6,13.61C16.27,13.12 17.21,12.88 18.43,12.88H19.83V12.24C19.83,11.75 19.68,11.36 19.38,11.07C19.08,10.78 18.63,10.64 18.05,10.64C17.53,10.64 17.1,10.76 16.75,11C16.4,11.25 16.23,11.54 16.23,11.89H14.77C14.77,11.46 14.92,11.05 15.22,10.65C15.5,10.25 15.93,9.94 16.44,9.71C16.95,9.5 17.5,9.36 18.13,9.36C19.11,9.36 19.87,9.6 20.42,10.09C20.97,10.58 21.26,11.25 21.28,12.11V16C21.28,16.8 21.38,17.42 21.58,17.88V18H20.06M17.66,16.88C18.11,16.88 18.54,16.77 18.95,16.56C19.35,16.35 19.65,16.07 19.83,15.73V14.16H18.7C16.93,14.16 16.04,14.63 16.04,15.57C16.04,16 16.19,16.3 16.5,16.53C16.8,16.76 17.18,16.88 17.66,16.88M5.46,13.71H9.53L7.5,8.29L5.46,13.71M6.64,6H8.36L13.07,18H11.14L10.17,15.43H4.82L3.86,18H1.93L6.64,6Z"
      />
    </SvgIcon>
  );
};
