import React from "react";
import { Box, CircularProgress } from "@mui/material";

export const MDLoader: React.FC = () => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 3, width: "100%" }}>
      <CircularProgress size={32} thickness={4} />
    </Box>
  );
};

export default MDLoader;
