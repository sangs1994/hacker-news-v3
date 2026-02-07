import * as React from "react";
import { Box, Button, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import type { FeedKind, TimeRange, HNStory } from "../types/index";
import { withinRange } from "../utils/filters";

import BlogFiltersBar from "../features/news/components/BlogFiltersBar";
import StoryCard from "../components/StoryCard/StoryCard";
import BestPicks from "../features/news/components/BestPicks";
import CommentsDialog from "../components/CommentsDialog/CommentsDialog";
import { StoriesSkeleton } from "../components/StoryCard/StoryCardSkeleton";

import { useStories } from "../hooks/useStories";
import { useBestPicks } from "../hooks/useBestPicks";

export default function NewsPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [feedKind, setFeedKind] = React.useState<FeedKind>("new");
  const [range, setRange] = React.useState<TimeRange>("1d");
  const [search, setSearch] = React.useState("");

  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [activeStory, setActiveStory] = React.useState<HNStory | null>(null);

  const storiesQuery = useStories(feedKind, 30);
  const bestPicksQuery = useBestPicks();

  const filteredStories = React.useMemo(() => {
    const list = storiesQuery.data ?? [];
    return list
      .filter((s) => withinRange(s.time, range))
      .filter((s) => {
        if (!search.trim()) return true;
        return s.title.toLowerCase().includes(search.trim().toLowerCase());
      });
  }, [storiesQuery.data, range, search]);

  const openComments = (storyId: number) => {
    const story =
      (storiesQuery.data ?? []).find((s) => s.id === storyId) ?? null;
    setActiveStory(story);
    setCommentsOpen(true);
  };

  const closeComments = () => {
    setCommentsOpen(false);
    setActiveStory(null);
  };

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 3 },
        boxSizing: "border-box",
        marginTop: 3,
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        alignItems="flex-start"
      >
        {/* LEFT FEED */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <BlogFiltersBar
            feedKind={feedKind}
            onFeedKindChange={setFeedKind}
            search={search}
            onSearchChange={setSearch}
            range={range}
            onRangeChange={setRange}
          />

          {storiesQuery.isLoading && <StoriesSkeleton count={5} />}

          {storiesQuery.isError && (
            <Typography color="error">Failed to load stories.</Typography>
          )}

          {!storiesQuery.isLoading && !storiesQuery.isError && (
            <Stack spacing={1.5}>
              {filteredStories.map((story, i) => (
                <StoryCard
                  key={story.id}
                  story={story}
                  index={i + 1}
                  onOpenComments={openComments}
                />
              ))}

              {filteredStories.length === 0 && (
                <Typography color="text.secondary">
                  No results for your filters/search.
                </Typography>
              )}

              <Button
                variant="outlined"
                sx={{ alignSelf: "center", borderRadius: 2 }}
              >
                Load more
              </Button>
            </Stack>
          )}
        </Box>

        {/* RIGHT BEST PICKS (desktop only) */}
        {isDesktop && (
          <BestPicks
            isLoading={bestPicksQuery.isLoading}
            isError={bestPicksQuery.isError}
            data={bestPicksQuery.data}
          />
        )}
      </Stack>
      <CommentsDialog
        open={commentsOpen}
        story={activeStory}
        onClose={closeComments}
      />
    </Box>
  );
}
