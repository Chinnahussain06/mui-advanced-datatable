import React from "react";
import { TextField, TextFieldProps } from "@mui/material";

export type MDInputProps = TextFieldProps;

export const MDInput: React.FC<MDInputProps> = (props) => {
  const { sx, ...rest } = props;
  return (
    <TextField
      variant="outlined"
      size="small"
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "6px",
        },
        ...sx
      }}
      {...rest}
    />
  );
};

export default MDInput;
