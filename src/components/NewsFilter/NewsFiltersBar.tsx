import * as React from "react";
import {
  Box,
  IconButton,
  Stack,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

import type { FeedKind } from "../../types";

type Props = {
  feedKind: FeedKind;
  search: string;
  selectedDate: Date;

  onFeedKindChange: (v: FeedKind) => void;
  onSearchChange: (v: string) => void;
  onSelectedDateChange: (d: Date) => void;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

// Local YYYY-MM-DD
function toYYYYMMDD(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function fromYYYYMMDD(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

function addDays(date: Date, delta: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + delta);
  return d;
}

function clampToToday(d: Date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const x = new Date(d);
  x.setHours(0, 0, 0, 0);

  return x.getTime() > today.getTime() ? today : x;
}

export default function BlogFiltersBar({
  feedKind,
  search,
  selectedDate,
  onFeedKindChange,
  onSearchChange,
  onSelectedDateChange,
}: Props) {
  const isTop = feedKind === "top";

  const today = React.useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const maxDate = React.useMemo(() => toYYYYMMDD(today), [today]);

  const isAtToday = React.useMemo(() => {
    const a = new Date(selectedDate);
    a.setHours(0, 0, 0, 0);
    return a.getTime() === today.getTime();
  }, [selectedDate, today]);

  const hiddenDateRef = React.useRef<HTMLInputElement | null>(null);

  const openNativePicker = React.useCallback(() => {
    const el = hiddenDateRef.current;
    if (!el) return;

    if (typeof el.showPicker === "function") el.showPicker();
    else {
      el.focus();
      el.click();
    }
  }, []);

  return (
    <Box sx={{ px: 1.5, py: 1 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {/* LEFT: underline tabs */}
        <Tabs
          value={feedKind}
          onChange={(_, v) => onFeedKindChange(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 32,
            "& .MuiTab-root": {
              minHeight: 32,
              padding: "6px 12px",
              textTransform: "none",
              fontWeight: 500,
            },
          }}
        >
          <Tab label="Top" value="top" />
          <Tab label="New" value="new" />
          <Tab label="Best" value="best" />
        </Tabs>

        {/* CENTER: date controls ONLY for TOP (otherwise keep a spacer so layout stays stable) */}
        {isTop ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              onClick={() => onSelectedDateChange(addDays(selectedDate, -1))}
              size="small"
              sx={{
                width: 36,
                height: 36,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
              aria-label="Previous day"
            >
              <ChevronLeftIcon />
            </IconButton>

            {/* Visible date pill */}
            <TextField
              size="small"
              value={toYYYYMMDD(selectedDate)}
              onClick={openNativePicker}
              inputProps={{
                readOnly: true,
                "aria-label": "Select date",
              }}
              sx={{
                width: 230,
                cursor: "pointer",
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  height: 36,
                },
                "& input": {
                  padding: "8px 10px",
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: 0.2,
                  cursor: "pointer",
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ pr: 0.5 }}>
                    <CalendarMonthOutlinedIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end" sx={{ pl: 0.5 }}>
                    <KeyboardArrowDownIcon />
                  </InputAdornment>
                ),
              }}
            />

            {/* Hidden native date input */}
            <input
              ref={(node) => {
                hiddenDateRef.current = node;
              }}
              type="date"
              value={toYYYYMMDD(selectedDate)}
              max={maxDate}
              onChange={(e) => {
                const v = e.target.value;
                if (!v) return;
                onSelectedDateChange(fromYYYYMMDD(v));
              }}
              style={{
                position: "absolute",
                opacity: 0,
                pointerEvents: "none",
                width: 0,
                height: 0,
              }}
              tabIndex={-1}
              aria-hidden="true"
            />

            <IconButton
              onClick={() =>
                onSelectedDateChange(clampToToday(addDays(selectedDate, +1)))
              }
              disabled={isAtToday}
              size="small"
              sx={{
                width: 36,
                height: 36,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
              }}
              aria-label="Next day"
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        ) : (
          // Spacer keeps search aligned even when date controls are hidden
          <Box sx={{ width: 36 + 230 + 36 + 16 /* icons+field+gap */ }} />
        )}

        {/* RIGHT: search for ALL tabs */}
        <TextField
          size="small"
          placeholder="Search title…"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            width: 260,
            "& .MuiOutlinedInput-root": { borderRadius: 2, height: 36 },
          }}
        />
      </Stack>
    </Box>
  );
}
