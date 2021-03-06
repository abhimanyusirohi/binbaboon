import React, { useState } from "react";
import ReactDOM from "react-dom";

import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import FileOpenIcon from "@mui/icons-material/FileOpen";
import GitHubIcon from "@mui/icons-material/GitHub";

import { blue } from "@mui/material/colors";

import { ApplicationStore } from "./ApplicationStore";
import { DataStore } from "./DataStore";
import { App } from "./components/App";
import { AlertDialog } from "./components/AlertDialog";

import baboonImage from "./baboon.svg";

import "./index.css";
import "@fontsource/roboto";
import "@fontsource/roboto-mono";

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
        setAlertMessage(`The selected file "${file.name}" is empty`);
        return;
      } else if (fileData.byteLength > 100 * 1024 * 1024) {
        setAlertMessage(
          `The selected file "${file.name}" is too large. Select a file that is less than 100 MB in size`
        );
        return;
      }

      const dataStore = new DataStore(file.name, file.type, new Uint8Array(fileData));

      const appStore = new ApplicationStore(dataStore);
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

  const openInNewTab = (url: string) => {
    const newWindow = window.open(url, "_blank", "noopener,noreferrer");
    if (newWindow) {
      newWindow.opener = null;
    }
  };

  return store ? (
    <App store={store} onClose={() => setStore(undefined)} />
  ) : (
    <Stack direction="column" spacing={8} justifyContent="center" alignItems="center">
      <Banner text="BinBaboon" />
      <img src={baboonImage} alt="BinBaboon" width="15%" />
      <Button variant="contained" size="large" startIcon={<FileOpenIcon />} onClick={showOpenFileDialog}>
        Select File
      </Button>
      <Typography variant="overline">
        BinBaboon keeps your file in your browser. It is not uploaded to any server
      </Typography>
      <Container disableGutters>
        <Divider orientation="horizontal">
          <Chip label={process.env.REACT_APP_VERSION} size="small" variant="outlined" />
        </Divider>
      </Container>
      <IconButton onClick={() => openInNewTab("https://github.com/abhimanyusirohi/binbaboon")}>
        <GitHubIcon />
      </IconButton>
      {alertMessage && <AlertDialog infoText={alertMessage} onClose={() => setAlertMessage("")} />}
    </Stack>
  );
};

const Banner: React.FunctionComponent<{ text: string }> = ({ text }) => {
  return (
    <Stack direction="row" spacing={1}>
      {[...text].map((character, index) => (
        <Avatar
          key={`${character}-${index}`}
          variant="rounded"
          sx={{ bgcolor: blue[character === character.toLocaleUpperCase() ? 600 : 300] }}
        >
          {character.toLocaleUpperCase()}
        </Avatar>
      ))}
    </Stack>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>,
  document.getElementById("root")
);
