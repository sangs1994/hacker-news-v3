import React from "react";
import { Paper, Box } from "@mui/material";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        maxWidth: "none",
        m: 0,
        border: "1px solid #E6E8F0",
        backgroundColor: "grey.50",
        minHeight: "calc(100vh - 72px - 48px)",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
