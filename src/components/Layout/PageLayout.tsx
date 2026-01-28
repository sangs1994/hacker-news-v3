import React from "react";
import { Box, Container, Paper } from "@mui/material";

export default function PageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#F6F7FB" }}>
      <Container maxWidth={false} sx={{ px: 3, py: 3 }}>
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: "1px solid #E6E8F0",
            backgroundColor: "#FDFDFE",
            minHeight: "calc(100vh - 72px - 48px)",
            p: 3,
          }}
        >
          {children}
        </Paper>
      </Container>
    </Box>
  );
}
