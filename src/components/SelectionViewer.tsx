import React, { useState } from "react";
import { observer } from "mobx-react-lite";

import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CardHeader from "@mui/material/CardHeader";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Grid from "@mui/material/Grid";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { blue } from "@mui/material/colors";

import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import ForwardIcon from "@mui/icons-material/ForwardOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { Selection } from "../stores/Selection";
import { SelectionStore } from "../stores/SelectionStore";

/**
 * TODO:
 * 1. Int24, Int40, Int48, Int56 [DONE]
 * 2. Copy selected HEX values (without spaces)
 * 3. Always show int representation, show - when not available [DONE]
 */

export interface SelectionViewerProps {
  store: SelectionStore;
}

export const SelectionViewer: React.FunctionComponent<SelectionViewerProps> = observer(({ store }) => {
  const [bigEndian, setBigEndian] = useState<boolean>(true);

  const hasIntRepresentation = store.selectedData.length <= 8;
  const integerSize = hasIntRepresentation ? store.selectedData.length * 8 : "";
  const { signedValue, unsignedValue } = convertToIntegerValues(store.selectedData, bigEndian);
  const binaryString = convertToBinaryString(store.selectedData, bigEndian);
  const hexString = Array.from(store.selectedData)
    .map((value) => value.toString(16).toUpperCase().padStart(2, "0"))
    .join(" ");

  const handleCopy = (value: string): void => {
    navigator.clipboard.writeText(value);
  };

  const handleGoToOffset = (value: string): void => {
    const offset = parseInt(value);
    store.setSelection(new Selection(offset, offset));
    store.scrollToSelection();
  };

  const subheader = `${store.selectedData.length} byte${store.selectedData.length > 1 ? "s" : ""} selected (${
    store.currentSelection.fromOffset
  } ➔ ${store.currentSelection.toOffset})`;

  return (
    <Accordion elevation={4}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }}>
              <SelectAllIcon />
            </Avatar>
          }
          title="Selection"
          subheader={subheader}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" spacing={1}>
          <DataDisplay dataType={`Hex`} dataValue={hexString} wrapValue={false} onCopy={handleCopy} />
          <Container disableGutters>
            <ToggleButtonGroup
              size="small"
              value={bigEndian}
              exclusive
              fullWidth
              onChange={(_, endianess) => setBigEndian(endianess)}
            >
              <ToggleButton value={true}>Big endian</ToggleButton>
              <ToggleButton value={false}>Little endian</ToggleButton>
            </ToggleButtonGroup>
            <Grid container spacing={1} mt={1}>
              <Grid item lg={12}>
                <DataDisplay
                  dataType={`Int${integerSize}`}
                  dataValue={hasIntRepresentation ? signedValue.toString() : "-"}
                  onCopy={hasIntRepresentation ? handleCopy : undefined}
                  onGoToOffset={
                    hasIntRepresentation && store.isValidSelection(new Selection(signedValue, signedValue))
                      ? handleGoToOffset
                      : undefined
                  }
                />
              </Grid>
              <Grid item lg={12}>
                <DataDisplay
                  dataType={`UInt${integerSize}`}
                  dataValue={hasIntRepresentation ? unsignedValue.toString() : "-"}
                  onCopy={hasIntRepresentation ? handleCopy : undefined}
                  onGoToOffset={
                    hasIntRepresentation && store.isValidSelection(new Selection(unsignedValue, unsignedValue))
                      ? handleGoToOffset
                      : undefined
                  }
                />
              </Grid>
              <Grid item lg={12}>
                <DataDisplay
                  dataType="Binary"
                  dataValue={hasIntRepresentation ? binaryString : "-"}
                  onCopy={hasIntRepresentation ? handleCopy : undefined}
                />
              </Grid>
            </Grid>
          </Container>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
});

interface DataDisplayProps {
  dataType: string;
  dataValue: string;
  wrapValue?: boolean;
  onCopy?: (value: string) => void;
  onGoToOffset?: (value: string) => void;
}

/**
 * Component that displays a single set of key-value data pair
 */
const DataDisplay: React.FunctionComponent<DataDisplayProps> = ({
  dataType,
  dataValue,
  wrapValue = true,
  onCopy,
  onGoToOffset
}) => {
  return (
    <Container disableGutters>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography
          data-testid={`${dataType}-value`}
          variant="subtitle1"
          sx={{ fontFamily: "monospace" }}
          noWrap={!wrapValue}
        >
          {dataValue}
        </Typography>
        <div>
          {onCopy && (
            <Tooltip title="Copy" arrow>
              <IconButton
                data-testid={`${dataType}-copy`}
                size="small"
                color="inherit"
                onClick={() => onCopy(dataValue)}
              >
                <ContentCopyIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
          {onGoToOffset && (
            <Tooltip title={`Go to offset ${dataValue}`} arrow>
              <IconButton
                data-testid={`${dataType}-goto`}
                size="small"
                color="inherit"
                onClick={() => onGoToOffset(dataValue)}
              >
                <ForwardIcon fontSize="inherit" />
              </IconButton>
            </Tooltip>
          )}
        </div>
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {dataType}
      </Typography>
    </Container>
  );
};

function convertToIntegerValues(bytes: Uint8Array, bigEndian: boolean): { signedValue: number; unsignedValue: number } {
  let signedValue = 0;
  let unsignedValue = 0;
  const dataView = new DataView(bytes.buffer);

  switch (bytes.length) {
    case 1:
      signedValue = dataView.getInt8(0);
      unsignedValue = dataView.getUint8(0);
      break;

    case 2:
      signedValue = dataView.getInt16(0, !bigEndian);
      unsignedValue = dataView.getUint16(0, !bigEndian);
      break;

    case 4:
      signedValue = dataView.getInt32(0, !bigEndian);
      unsignedValue = dataView.getUint32(0, !bigEndian);
      break;

    case 3:
    case 5:
    case 6:
    case 7:
      signedValue = unsignedValue = convertNonStandardIntegerSize(bytes, !bigEndian);
      break;

    case 8:
      signedValue = Number(dataView.getBigInt64(0, !bigEndian));
      unsignedValue = Number(dataView.getBigUint64(0, !bigEndian));
      break;

    default:
      break;
  }

  return { signedValue, unsignedValue };
}

/**
 * Converts non-standard size bytes (3,5,6,7) to a number
 * E.g. Each bytes in a 3 byte array is left shifted and or'ed to make a number
 */
function convertNonStandardIntegerSize(data: Uint8Array, bigEndian: boolean): number {
  const bytes = [...data];
  if (!bigEndian) {
    bytes.reverse();
  }

  // Similar to (bytes[0] << 16) | (bytes[1] << 8) | bytes[2] << 0;
  return bytes.reduce((previous, current, index) => previous | (current << ((bytes.length - index - 1) * 8)), 0);
}

/**
 * Converts the specified byte array into a binary string grouped into 8 bits chunks
 */
function convertToBinaryString(bytes: Uint8Array, bigEndian: boolean): string {
  const bytesCopy = [...bytes];

  // Align to the next integer 32 or 64
  if (bytesCopy.length === 3) {
    bytesCopy.splice(0, 0, 0);
  } else if (bytesCopy.length >= 5 && bytesCopy.length <= 7) {
    bytesCopy.splice(0, 0, ...Array<number>(8 - bytesCopy.length).fill(0));
  }

  if (!bigEndian) {
    bytesCopy.reverse();
  }

  const binaryString = bytesCopy.reduce((str, byte) => str + byte.toString(2).padStart(8, "0"), "");
  return binaryString.replace(/(.{8})/g, "$1 ").trim();
}
