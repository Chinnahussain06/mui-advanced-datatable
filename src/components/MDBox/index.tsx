import React from "react";
import { Box, BoxProps } from "@mui/material";

export interface MDBoxProps extends BoxProps {
  bgColor?: string;
  borderRadius?: string | number;
  shadow?: string;
  opacity?: number;
}

export const MDBox: React.FC<MDBoxProps> = ({ 
  children, 
  bgColor, 
  borderRadius, 
  shadow, 
  opacity,
  sx, 
  ...rest 
}) => {
  return (
    <Box
      sx={{
        backgroundColor: bgColor,
        borderRadius: borderRadius,
        boxShadow: shadow,
        opacity: opacity,
        ...sx
      }}
      {...rest}
    >
      {children}
    </Box>
  );
};

export default MDBox;
