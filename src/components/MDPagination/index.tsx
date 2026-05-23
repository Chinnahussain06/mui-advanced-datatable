import React from "react";
import { IconButton, IconButtonProps } from "@mui/material";

export interface MDPaginationProps extends IconButtonProps {
  active?: boolean;
}

export const MDPagination: React.FC<MDPaginationProps> = ({ 
  children, 
  active, 
  sx, 
  ...rest 
}) => {
  return (
    <IconButton
      size="small"
      sx={{
        width: "32px",
        height: "32px",
        borderRadius: "6px",
        border: "1px solid",
        borderColor: active ? "primary.main" : "divider",
        backgroundColor: active ? "primary.light" : "transparent",
        color: active ? "primary.main" : "text.secondary",
        "&:hover": {
          backgroundColor: active ? "primary.light" : "action.hover",
        },
        "&:disabled": {
          opacity: 0.4,
          borderColor: "action.disabledBackground"
        },
        ...sx
      }}
      {...rest}
    >
      {children}
    </IconButton>
  );
};

export default MDPagination;
