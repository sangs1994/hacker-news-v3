import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import { NavLink, useLocation, useNavigate } from "react-router-dom";

export type HeaderTab = "news" | "ask" | "show" | "jobs";

const NAV_TABS: { label: string; path: HeaderTab }[] = [
  { label: "News", path: "news" },
  { label: "Ask", path: "ask" },
  { label: "Show", path: "show" },
  { label: "Jobs", path: "jobs" },
];

const MOBILE_PRIMARY: HeaderTab[] = ["news", "ask", "jobs"];

const tabSx = {
  textTransform: "none",
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 2,
  px: 1.5,
  color: "#6B7280",
  "&.active": { color: "#2563EB" },
  "&:hover": { backgroundColor: "#F6F7FB" },
};

const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const currentPath = (location.pathname.replace("/", "") ||
    "news") as HeaderTab;

  const primaryTabs = NAV_TABS.filter((t) => MOBILE_PRIMARY.includes(t.path));
  const moreTabs = NAV_TABS.filter((t) => !MOBILE_PRIMARY.includes(t.path));

  const activeInMore = moreTabs.some((t) => t.path === currentPath);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ backgroundColor: "#fff", borderBottom: "1px solid #E6E8F0" }}
    >
      <Toolbar
        sx={{
          height: { xs: "auto", sm: 72 },
          px: { xs: 1.5, sm: 3 },
          py: { xs: 1, sm: 0 },
          flexWrap: { xs: "wrap", sm: "nowrap" }, // 🔑 prevents overlap
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* LEFT : Brand */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          sx={{
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
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
              flexShrink: 0,
            }}
          >
            HN
          </Box>

          <Stack spacing={0} sx={{ minWidth: 0 }}>
            <Typography
              fontWeight={800}
              color="#08090b"
              sx={{
                whiteSpace: "nowrap",
                fontSize: { xs: 18, sm: 20 },
              }}
            >
              Hacker News
            </Typography>

            <Typography
              fontSize={12}
              color="#6B7280"
              sx={{ display: { xs: "none", sm: "block" } }}
            >
              Tech and startup news for developers
            </Typography>
          </Stack>
        </Stack>

        {/* CENTER : Navigation */}
        <Box
          sx={{
            flex: { xs: "1 1 100%", sm: 1 },
            order: { xs: 2, sm: 0 },
            display: "flex",
            justifyContent: { xs: "flex-start", sm: "center" },
            minWidth: 0,
          }}
        >
          {/* Desktop tabs */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {NAV_TABS.map((tab) => (
              <Button
                key={tab.path}
                component={NavLink}
                to={`/${tab.path}`}
                sx={tabSx}
              >
                {tab.label}
              </Button>
            ))}
          </Stack>

          {/* Mobile tabs */}
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "flex", sm: "none" } }}
          >
            {primaryTabs.map((tab) => (
              <Button
                key={tab.path}
                component={NavLink}
                to={`/${tab.path}`}
                sx={tabSx}
              >
                {tab.label}
              </Button>
            ))}

            <Button
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                ...tabSx,
                color: activeInMore ? "#2563EB" : "#6B7280",
              }}
            >
              More
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  border: "1px solid #E6E8F0",
                },
              }}
            >
              {moreTabs.map((tab, i) => (
                <React.Fragment key={tab.path}>
                  <MenuItem
                    onClick={() => {
                      navigate(`/${tab.path}`);
                      setAnchorEl(null);
                    }}
                    sx={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: currentPath === tab.path ? "#2563EB" : "#111827",
                    }}
                  >
                    {tab.label}
                  </MenuItem>
                  {i < moreTabs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </Menu>
          </Stack>
        </Box>

        {/* RIGHT : Actions */}
        <Stack
          direction="row"
          spacing={1}
          sx={{
            order: { xs: 3, sm: 0 },
            ml: "auto",
          }}
        >
          <Button
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "10px",
              fontSize: 12,
              fontWeight: 700,
              borderColor: "#E6E8F0",
              textTransform: "none",
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "inline" } }}>Submit</Box>
            <Box sx={{ display: { xs: "inline", sm: "none" } }}>＋</Box>
          </Button>

          <Button
            variant="outlined"
            sx={{
              height: 34,
              borderRadius: "10px",
              fontSize: 12,
              fontWeight: 700,
              borderColor: "#E6E8F0",
              textTransform: "none",
              minWidth: 0,
              px: { xs: 1, sm: 1.5 },
            }}
          >
            <Box sx={{ display: { xs: "none", sm: "inline" } }}>Login</Box>
            <Box sx={{ display: { xs: "inline", sm: "none" } }}>🔐</Box>
          </Button>
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
