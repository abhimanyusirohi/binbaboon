import React, { ReactNode } from "react";

import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CardHeader from "@mui/material/CardHeader";
import Stack from "@mui/material/Stack";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface ViewContainerProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({ icon, title, description, children }) => {
  return (
    <Accordion defaultExpanded={true} disableGutters variant="outlined">
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: "primary.main" }}>{icon}</Avatar>}
          title={title}
          subheader={description}
        />
      </AccordionSummary>
      <AccordionDetails>
        <Stack direction="column" spacing={1} alignItems="end">
          {children}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};
