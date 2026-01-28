import React from "react";
import { AppBar, Toolbar, Typography, Box, Button, Stack } from "@mui/material";
import { NavLink } from "react-router-dom";

export type HeaderTab = "blogs" | "ask" | "show" | "jobs";

const NAV_TABS: { label: string; path: HeaderTab }[] = [
  { label: "Blogs", path: "blogs" },
  { label: "Ask", path: "ask" },
  { label: "Show", path: "show" },
  { label: "Jobs", path: "jobs" },
];

const Header: React.FC = () => {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ backgroundColor: "#fff", borderBottom: "1px solid #E6E8F0" }}
    >
      <Toolbar sx={{ height: 72, px: 3 }}>
        {/* Left brand */}
        <Stack direction="row" spacing={2} alignItems="center" minWidth={420}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "10px",
              backgroundColor: "#F97316",
              display: "grid",
              placeItems: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            HN
          </Box>

          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography fontSize={20} fontWeight={800} color="#08090b">
              Hacker News
            </Typography>
            <Typography fontSize={12} color="#6B7280">
              Tech and startup news for developers
            </Typography>
          </Stack>
        </Stack>

        {/* Center navigation */}
        <Stack direction="row" spacing={2} justifyContent="center" flex={1}>
          {NAV_TABS.map((tab) => (
            <Button
              key={tab.path}
              component={NavLink}
              to={`/${tab.path}`}
              sx={{
                textTransform: "none",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 2,
                px: 1.5,
                color: "#6B7280",
                "&.active": {
                  color: "#2563EB",
                },
                "&:hover": { backgroundColor: "#F6F7FB" },
              }}
            >
              {tab.label}
            </Button>
          ))}
        </Stack>

        {/* Right */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: 12,
              fontWeight: 700,
              borderColor: "#E6E8F0",
              color: "#111827",
            }}
          >
            Submit
          </Button>
          <Button
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "10px",
              textTransform: "none",
              fontSize: 12,
              fontWeight: 700,
              borderColor: "#E6E8F0",
              color: "#111827",
            }}
          >
            Login
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
