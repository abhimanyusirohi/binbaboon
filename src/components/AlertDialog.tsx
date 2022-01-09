import * as React from "react";

import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";

export interface AlertDialogProps {
  title?: string;
  infoText: string;
  buttonText?: string[];
  onClose: (result: string) => void;
}

/**
 * A modal alert dialog component
 */
export const AlertDialog: React.FunctionComponent<AlertDialogProps> = ({
  title,
  infoText,
  buttonText = ["Close"],
  onClose
}) => {
  return (
    <Dialog open={true} maxWidth="sm" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <DialogContentText>{infoText}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {buttonText.map((text) => (
          <Button autoFocus onClick={() => onClose(text)}>
            {text}
          </Button>
        ))}
      </DialogActions>
    </Dialog>
  );
};
