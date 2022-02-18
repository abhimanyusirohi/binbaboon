import React, { ReactNode } from "react";

import Avatar from "@mui/material/Avatar";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import CardHeader from "@mui/material/CardHeader";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export interface ViewContainerProps {
  icon: ReactNode;
  title: string;
  description: string;
  defaultExpanded?: boolean;
}

export const ViewContainer: React.FC<ViewContainerProps> = ({
  icon,
  title,
  description,
  defaultExpanded = false,
  children
}) => {
  return (
    <Accordion elevation={4} defaultExpanded={defaultExpanded} disableGutters>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <CardHeader
          avatar={<Avatar sx={{ bgcolor: "primary.main" }}>{icon}</Avatar>}
          title={title}
          subheader={description}
        />
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
