import React from "react";
import { Card, Avatar, Box } from "@mui/material";
import MDTypography from "../MDTypography";

export interface MDStatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBgColor?: string;
  iconColor?: string;
  subtitle?: string;
}

export const MDStatsCard: React.FC<MDStatsCardProps> = ({
  title,
  value,
  icon,
  iconBgColor = "primary.light",
  iconColor = "primary.main",
  subtitle
}) => {
  return (
    <Card sx={{ p: 2.5, borderRadius: "10px", display: "flex", gap: 2, alignItems: "center", boxShadow: "0 2px 10px rgba(0,0,0,0.03)" }}>
      <Avatar sx={{ bgcolor: iconBgColor, color: iconColor }}>
        {icon}
      </Avatar>
      <Box>
        <MDTypography variant="caption" color="textSecondary" fontWeight="bold">
          {title}
        </MDTypography>
        <MDTypography variant="h5" fontWeight="bold" sx={{ color: "#344767", lineHeight: 1.2 }}>
          {value}
        </MDTypography>
        {subtitle && (
          <MDTypography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.25, fontSize: "0.6875rem" }}>
            {subtitle}
          </MDTypography>
        )}
      </Box>
    </Card>
  );
};

export default MDStatsCard;
