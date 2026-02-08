// src/features/news/components/BlogFiltersBar.tsx
import * as React from "react";
import {
  Box,
  Stack,
  Tabs,
  Tab,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  IconButton,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { FeedKind, TimeRange } from "../../../types/index";

type Props = {
  feedKind: FeedKind;
  onFeedKindChange: (kind: FeedKind) => void;

  search: string;
  onSearchChange: (value: string) => void;

  range: TimeRange;
  onRangeChange: (value: TimeRange) => void;

  dateLabel: string;
  onPrevDate: () => void;
  onNextDate: () => void;
  onDateClick?: () => void;
};

export default function BlogFiltersBar({
  feedKind,
  onFeedKindChange,
  search,
  onSearchChange,
  range,
  onRangeChange,
  dateLabel,
  onPrevDate,
  onNextDate,
  onDateClick,
}: Props) {
  return (
    <Box
      sx={{
        width: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.paper",
        p: { xs: 1.25, sm: 1.5 },
      }}
    >
      <Stack spacing={1.25}>
        {/* Tabs */}
        <Tabs
          value={feedKind}
          onChange={(_, v) => onFeedKindChange(v)}
          variant="fullWidth"
          sx={{
            minHeight: 40,
            "& .MuiTabs-indicator": { height: 3, borderRadius: 2 },
            "& .MuiTab-root": {
              minHeight: 40,
              textTransform: "none",
              fontWeight: 800,
            },
          }}
        >
          <Tab value="top" label="Top" />
          <Tab value="new" label="New" />
        </Tabs>

        {/* Date controls */}
        <Stack direction="row" spacing={1} alignItems="center">
          <IconButton
            onClick={onPrevDate}
            aria-label="Previous day"
            size="small"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              flex: "0 0 auto",
            }}
          >
            <ChevronLeftIcon />
          </IconButton>

          <Button
            onClick={onDateClick}
            variant="outlined"
            startIcon={<CalendarTodayOutlinedIcon fontSize="small" />}
            endIcon={<KeyboardArrowDownIcon />}
            sx={{
              height: 40,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 800,
              borderColor: "divider",
              flex: 1,
              justifyContent: "space-between",
              px: 1.25,
              minWidth: 0,
            }}
          >
            {dateLabel}
          </Button>

          <IconButton
            onClick={onNextDate}
            aria-label="Next day"
            size="small"
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              flex: "0 0 auto",
            }}
          >
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        {/* Search */}
        <TextField
          size="small"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search titles or domains..."
          fullWidth
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              height: 40,
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />

        {/* Range pills */}
        <ToggleButtonGroup
          value={range}
          exclusive
          onChange={(_, v) => v && onRangeChange(v)}
          size="small"
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            "& .MuiToggleButtonGroup-grouped": {
              ml: "0 !important",
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              height: 40,
              fontWeight: 800,
              textTransform: "none",
              width: "100%",
            },
            "& .MuiToggleButton-root.Mui-selected": {
              bgcolor: "primary.50",
              borderColor: "primary.200",
            },
          }}
        >
          <ToggleButton value="1d">1 DAY</ToggleButton>
          <ToggleButton value="1m">1 MONTH</ToggleButton>
          <ToggleButton value="1y">1 YEAR</ToggleButton>
        </ToggleButtonGroup>
      </Stack>
    </Box>
  );
}
