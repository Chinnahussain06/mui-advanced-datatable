import React from "react";
import { Button, ButtonProps } from "@mui/material";

export interface MDBtnProps extends ButtonProps {
  circular?: boolean;
}

export const MDButton: React.FC<MDBtnProps> = ({ children, circular, sx, ...rest }) => {
  return (
    <Button
      sx={{
        borderRadius: circular ? "24px" : "6px",
        textTransform: "none",
        fontWeight: 600,
        ...sx
      }}
      {...rest}
    >
      {children}
    </Button>
  );
};

export default MDButton;
