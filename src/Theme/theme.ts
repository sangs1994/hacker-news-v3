import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#F97316" }, // your HN orange
    secondary: { main: "#2563EB" },
    background: { default: "#F6F7FB", paper: "#FFFFFF" },
    text: { primary: "#111827", secondary: "#6B7280" },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","),
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiButton: {
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 16 } },
    },
  },
});
