import React from "react";
import { Box, Container, Paper } from "@mui/material";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid #E6E8F0",
        backgroundColor: "grey.50",
        minHeight: "calc(100vh - 72px - 48px)",
        px: { xs: 2, md: 3 },
      }}
    >
      {children}
    </Paper>
  );
}
