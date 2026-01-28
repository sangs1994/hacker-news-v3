import * as React from "react";
import {
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import type { FeedKind, TimeRange } from "../../../types/index";

type Props = {
  feedKind: FeedKind;
  onFeedKindChange: (kind: FeedKind) => void;

  search: string;
  onSearchChange: (value: string) => void;

  range: TimeRange;
  onRangeChange: (value: TimeRange) => void;
};

export default function BlogFiltersBar({
  feedKind,
  onFeedKindChange,
  search,
  onSearchChange,
  range,
  onRangeChange,
}: Props) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={1.5}
      alignItems={{ xs: "stretch", sm: "center" }}
      sx={{ mb: 2 }}
    >
      <Tabs
        value={feedKind}
        onChange={(_, v) => onFeedKindChange(v)}
        sx={{
          minHeight: 40,
          "& .MuiTab-root": {
            minHeight: 40,
            textTransform: "none",
            fontWeight: 700,
          },
        }}
      >
        <Tab value="top" label="Top" />
        <Tab value="new" label="New" />
      </Tabs>

      <TextField
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search blog…"
        sx={{ flex: 1, maxWidth: { xs: "100%", sm: 320 } }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <ToggleButtonGroup
        value={range}
        exclusive
        onChange={(_, v) => v && onRangeChange(v)}
        size="small"
        sx={{
          gap: 1,
          "& .MuiToggleButtonGroup-grouped": {
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            ml: "0 !important", // remove MUI default margin collapse
          },
          "& .MuiToggleButton-root": {
            textTransform: "none",
            borderRadius: 8,
            px: 1.5,
            fontWeight: 700,
          },
        }}
      >
        <ToggleButton value="1d">1 day</ToggleButton>
        <ToggleButton value="1m">1 month</ToggleButton>
        <ToggleButton value="1y">1 year</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
