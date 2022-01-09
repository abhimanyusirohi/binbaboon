import React from "react";

import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import Paper from "@mui/material/Paper";

import { blue } from "@mui/material/colors";

import InfoIcon from "@mui/icons-material/Info";

import { FileInfo } from "../stores/ApplicationStore";

export interface FileInfoViewerProps {
  fileInfo: FileInfo;
}

export const FileInfoViewer: React.FunctionComponent<FileInfoViewerProps> = ({ fileInfo }) => {
  return (
    <Paper elevation={2}>
      <Card>
        <CardHeader
          avatar={
            <Avatar sx={{ bgcolor: blue[500] }} aria-label="fileinfo">
              <InfoIcon />
            </Avatar>
          }
          title={fileInfo.name}
          subheader={`${fileInfo.size} bytes`}
        />
      </Card>
    </Paper>
  );
};
