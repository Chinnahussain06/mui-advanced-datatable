import React from "react";
import { Typography, TypographyProps } from "@mui/material";

export interface MDTypographyProps extends TypographyProps {
  fontWeight?: "light" | "regular" | "medium" | "bold" | number;
  textTransform?: "none" | "capitalize" | "uppercase" | "lowercase";
}

export const MDTypography: React.FC<MDTypographyProps> = ({ 
  children, 
  fontWeight, 
  textTransform, 
  sx, 
  ...rest 
}) => {
  const fwMap = {
    light: 300,
    regular: 400,
    medium: 500,
    bold: 700
  };

  const fwValue = typeof fontWeight === "string" ? fwMap[fontWeight] : fontWeight;

  return (
    <Typography
      sx={{
        ...(fwValue ? { fontWeight: fwValue } : {}),
        ...(textTransform ? { textTransform } : {}),
        ...sx
      }}
      {...rest}
    >
      {children}
    </Typography>
  );
};

export default MDTypography;
