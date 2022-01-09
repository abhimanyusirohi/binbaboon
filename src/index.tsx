import React, { useState } from "react";
import ReactDOM from "react-dom";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import FileOpenIcon from "@mui/icons-material/FileOpen";

import { blue } from "@mui/material/colors";

import { ApplicationStore, FileInfo } from "./stores/ApplicationStore";
import { App } from "./components/App";
import { AlertDialog } from "./components/AlertDialog";

import baboonImage from "./baboon.png";
import backgroundImage from "./background.png";

import "./index.css";
import "@fontsource/roboto";

const Home: React.FunctionComponent = () => {
  const [store, setStore] = useState<ApplicationStore>();
  const [alertMessage, setAlertMessage] = useState<string>("");

  const openFile = async (e: Event) => {
    e.preventDefault();

    const inputElement = e.target as HTMLInputElement;
    if (!inputElement || !inputElement.files) {
      return;
    }

    const file = inputElement.files[0];
    const reader = new FileReader();
    reader.onload = async (onloadEventArgs) => {
      const fileData = onloadEventArgs.target!.result as ArrayBuffer;
      if (fileData.byteLength === 0) {
        setAlertMessage("The file is empty");
        return;
      } else if (fileData.byteLength > 100 * 1024 * 1024) {
        setAlertMessage("The file is too large. Select a file that is less than 100 MB in size");
        return;
      }

      const fileInfo = new FileInfo(file.name, file.size, file.type, new Uint8Array(fileData));

      const appStore = new ApplicationStore(fileInfo);
      setStore(appStore);
    };

    reader.readAsArrayBuffer(inputElement.files[0]);
  };

  const showOpenFileDialog = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "*.*");
    input.setAttribute("multiple", "false");
    input.onchange = openFile;
    input.click();
  };

  return store ? (
    <App applicationStore={store} onClose={() => setStore(undefined)} />
  ) : (
    <Stack
      direction="column"
      spacing={0}
      justifyContent="space-evenly"
      alignItems="center"
      sx={{
        height: "100vh",
        width: "100vw",
        backgroundImage: `url(${backgroundImage})`,
        backgroundRepeat: "repeat",
        backgroundSize: "4%"
      }}
    >
      <Stack direction="row" spacing={1}>
        <Avatar variant="rounded" sx={{ bgcolor: blue[600] }}>
          B
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          I
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          N
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[600] }}>
          B
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          A
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          B
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          O
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          O
        </Avatar>
        <Avatar variant="rounded" sx={{ bgcolor: blue[300] }}>
          N
        </Avatar>
      </Stack>
      <img src={baboonImage} alt="BinBaboon" width={256} height={256} />
      <Button variant="contained" size="large" startIcon={<FileOpenIcon />} onClick={showOpenFileDialog}>
        Select File
      </Button>
      <Typography variant="subtitle2">File remains in your browser. It is not uploaded anywhere</Typography>
      {alertMessage && <AlertDialog infoText={alertMessage} onClose={() => setAlertMessage("")} />}
    </Stack>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
  document.getElementById("root")
);
