import * as React from "react";
import { Box, Stack, Typography, useMediaQuery } from "@mui/material";
import { useTheme } from "@mui/material/styles";

import type { FeedKind, TimeRange, HNStory } from "../types/index";
import { withinRange } from "../utils/filters";

import BlogFiltersBar from "../features/news/components/BlogFiltersBar";
import StoryCard from "../components/StoryCard/StoryCard";
import BestPicks from "../features/news/components/BestPicks";
import CommentsDialog from "../components/CommentsDialog/CommentsDialog";
import { StoriesSkeleton } from "../components/StoryCard/StoryCardSkeleton";

import { useBestPicks } from "../hooks/useBestPicks";
import { useStoriesInfinite } from "../hooks/useStoriesInfinite";

export default function NewsPage() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  const [feedKind, setFeedKind] = React.useState<FeedKind>("new");
  const [range, setRange] = React.useState<TimeRange>("1d");
  const [search, setSearch] = React.useState("");

  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [activeStory, setActiveStory] = React.useState<HNStory | null>(null);

  const storiesQuery = useStoriesInfinite(feedKind);
  const bestPicksQuery = useBestPicks();

  // ✅ flatten infinite pages into a single list
  const allStories = React.useMemo<HNStory[]>(() => {
    return storiesQuery.data?.pages.flatMap((p) => p.stories) ?? [];
  }, [storiesQuery.data]);

  const filteredStories = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return allStories
      .filter((s) => withinRange(s.time, range))
      .filter((s) => (q ? s.title.toLowerCase().includes(q) : true));
  }, [allStories, range, search]);

  const openComments = React.useCallback(
    (storyId: number) => {
      const story = allStories.find((s) => s.id === storyId) ?? null;
      setActiveStory(story);
      setCommentsOpen(true);
    },
    [allStories],
  );

  const closeComments = React.useCallback(() => {
    setCommentsOpen(false);
    setActiveStory(null);
  }, []);

  // ✅ sentinel for infinite scroll (same behavior as Show)
  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          storiesQuery.hasNextPage &&
          !storiesQuery.isFetchingNextPage
        ) {
          storiesQuery.fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [
    storiesQuery.fetchNextPage,
    storiesQuery.hasNextPage,
    storiesQuery.isFetchingNextPage,
  ]);

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
        mt: 3,
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

              {/* ✅ sentinel */}
              <div ref={sentinelRef} />

              {/* ✅ loading more */}
              {storiesQuery.isFetchingNextPage && <StoriesSkeleton count={3} />}
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
