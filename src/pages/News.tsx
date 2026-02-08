// src/pages/News.tsx
import * as React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

import type { FeedKind, TimeRange, HNStory } from "../types/index";

import BlogFiltersBar from "../features/news/components/BlogFiltersBar";
import StoryCard from "../components/StoryCard/StoryCard";
import CommentsDialog from "../components/CommentsDialog/CommentsDialog";
import { StoriesSkeleton } from "../components/StoryCard/StoryCardSkeleton";

import { withinRange } from "../utils/filters";
import { useStoriesInfinite } from "../hooks/useStoriesInfinite";

function formatDateLabel(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
}

function addDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

export default function NewsPage() {
  const [feedKind, setFeedKind] = React.useState<FeedKind>("top");
  const [range, setRange] = React.useState<TimeRange>("1d");
  const [search, setSearch] = React.useState("");

  const [activeDate, setActiveDate] = React.useState<Date>(() => new Date());
  const dateLabel = React.useMemo(
    () => formatDateLabel(activeDate),
    [activeDate],
  );

  const feedQuery = useStoriesInfinite(feedKind);

  const stories: HNStory[] = React.useMemo(() => {
    const pages = feedQuery.data?.pages ?? [];
    return pages.flatMap((p) => p.stories ?? []);
  }, [feedQuery.data]);

  const filteredStories: HNStory[] = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    return stories.filter((s) => {
      if (!withinRange(s.time, range)) return false;
      if (!q) return true;

      const title = (s.title ?? "").toLowerCase();
      const url = (s.url ?? "").toLowerCase();
      return title.includes(q) || url.includes(q);
    });
  }, [stories, range, search]);

  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [activeStory, setActiveStory] = React.useState<HNStory | null>(null);

  const onOpenComments = React.useCallback(
    (storyId: number) => {
      const found = filteredStories.find((s) => s.id === storyId) ?? null;
      setActiveStory(found);
      setCommentsOpen(true);
    },
    [filteredStories],
  );

  const onCloseComments = React.useCallback(() => {
    setCommentsOpen(false);
    setActiveStory(null);
  }, []);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    if (!feedQuery.hasNextPage || feedQuery.isFetchingNextPage) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) feedQuery.fetchNextPage();
      },
      { root: null, rootMargin: "400px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [
    feedQuery.hasNextPage,
    feedQuery.isFetchingNextPage,
    feedQuery.fetchNextPage,
  ]);

  return (
    // ✅ Break out of any parent maxWidth/container
    <Box
      sx={{
        width: "100%",
        maxWidth: "none !important",
        overflowX: "hidden",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "none !important",
          px: { xs: 1, sm: 2 },
          pb: { xs: 2, md: 3 },
          boxSizing: "border-box",
        }}
      >
        <Box sx={{ mt: { xs: 1.5, sm: 2.5, md: 3 }, mb: 2 }}>
          <BlogFiltersBar
            feedKind={feedKind}
            onFeedKindChange={setFeedKind}
            search={search}
            onSearchChange={setSearch}
            range={range}
            onRangeChange={setRange}
            dateLabel={dateLabel}
            onPrevDate={() => setActiveDate((d) => addDays(d, -1))}
            onNextDate={() => setActiveDate((d) => addDays(d, 1))}
          />
        </Box>

        {feedQuery.isLoading && <StoriesSkeleton />}

        {!feedQuery.isLoading && feedQuery.isError && (
          <Box sx={{ p: 2 }}>
            <Typography color="error" fontWeight={700}>
              Failed to load stories
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {feedQuery.error instanceof Error
                ? feedQuery.error.message
                : "Please try again."}
            </Typography>
          </Box>
        )}

        {!feedQuery.isLoading && !feedQuery.isError && (
          <Box
            sx={{
              display: "grid",
              gap: { xs: 1, sm: 1.25 },
              pb: 2,
              width: "100%",
            }}
          >
            {filteredStories.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                index={i + 1}
                onOpenComments={onOpenComments}
              />
            ))}

            {feedQuery.hasNextPage && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                {feedQuery.isFetchingNextPage ? (
                  <CircularProgress size={24} />
                ) : null}
                <div ref={sentinelRef} />
              </Box>
            )}
          </Box>
        )}

        <CommentsDialog
          open={commentsOpen}
          story={activeStory}
          onClose={onCloseComments}
        />
      </Box>
    </Box>
  );
}
