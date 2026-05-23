import React from "react";
import { Alert, AlertProps, Box } from "@mui/material";

import {
  Info as InfoIcon,
  WarningAmber as WarningIcon,
  CheckCircle as SuccessIcon,
  ErrorOutlined as ErrorIcon,
} from "@mui/icons-material";

import MDTypography from "../MDTypography";

export interface MDAlertProps extends AlertProps {
  title?: string;
  description?: React.ReactNode;
}

const getAlertIcon = (severity: AlertProps["severity"]) => {
  switch (severity) {
    case "success":
      return <SuccessIcon fontSize="inherit" />;

    case "warning":
      return <WarningIcon fontSize="inherit" />;

    case "error":
      return <ErrorIcon fontSize="inherit" />;

    case "info":
    default:
      return <InfoIcon fontSize="inherit" />;
  }
};

function MDAlert({
  title,
  description,
  severity = "info",
  children,
  sx,
  ...rest
}: MDAlertProps) {
  return (
    <Alert
      severity={severity}
      icon={getAlertIcon(severity)}
      sx={{
        borderRadius: 2,
        alignItems: "flex-start",

        "& .MuiAlert-message": {
          width: "100%",
        },

        ...sx,
      }}
      {...rest}
    >
      <Box>
        {title && (
          <MDTypography
            variant="button"
            fontWeight="bold"
            sx={{
              display: "block",
              mb: 0.5,
            }}
          >
            {title}
          </MDTypography>
        )}

        {description && (
          <MDTypography variant="caption" color="textSecondary">
            {description}
          </MDTypography>
        )}

        {children}
      </Box>
    </Alert>
  );
}

export default MDAlert;
