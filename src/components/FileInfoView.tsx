import React from "react";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";

import { DataStore } from "../DataStore";
import { CardContent } from "@mui/material";

export interface FileInfoViewProps {
  store: DataStore;
}

export const FileInfoView: React.FunctionComponent<FileInfoViewProps> = ({ store }) => {
  return (
    <Card variant="outlined">
      <CardContent>
        <CardHeader title={store.name} subheader={`${store.size} bytes`} />
      </CardContent>
    </Card>
  );
};
