import * as React from "react";
import { Box, Stack, Typography } from "@mui/material";

import type { FeedKind, HNStory } from "../types";

import BlogFiltersBar from "../components/NewsFilter/NewsFiltersBar";
import StoryCard from "../components/StoryCard/StoryCard";
import CommentsDialog from "../components/CommentsDialog/CommentsDialog";
import { StoriesSkeleton } from "../components/StoryCard/StoryCardSkeleton";

import { useStoriesInfinite } from "../hooks/useStoriesInfinite";

/** HN Firebase: time = unix seconds */
function getStoryTimeMs(story: any): number | null {
  const t = story?.time;
  return typeof t === "number" ? t * 1000 : null;
}

function getStoryIdNumber(story: any, fallbackIndex: number) {
  const raw = story?.id;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) ? n : fallbackIndex;
}

function hasAnyStoryAtOrBeforeDate(stories: any[], endMs: number) {
  for (const s of stories) {
    const ms = getStoryTimeMs(s);
    if (ms != null && ms <= endMs) return true;
  }
  return false;
}

export default function News() {
  const [feedKind, setFeedKind] = React.useState<FeedKind>("top");
  const [search, setSearch] = React.useState("");
  const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());

  const isTop = feedKind === "top";

  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [selectedStory, setSelectedStory] = React.useState<HNStory | null>(
    null,
  );

  const onCloseComments = React.useCallback(() => {
    setCommentsOpen(false);
    setSelectedStory(null);
  }, []);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } =
    useStoriesInfinite(feedKind);

  /** Flatten pages -> stories */
  const stories: HNStory[] = React.useMemo(() => {
    const pages = data?.pages ?? [];
    return pages.flatMap((p: any) => p?.stories ?? []);
  }, [data]);

  /** StoryCard expects (storyId: number) => void */
  const onOpenComments = React.useCallback(
    (storyId: number) => {
      const story =
        stories.find((s) => getStoryIdNumber(s, -1) === storyId) ?? null;
      setSelectedStory(story);
      setCommentsOpen(true);
    },
    [stories],
  );

  /**
   * Filtering:
   * - Search applies to ALL tabs
   * - Date filter applies ONLY to TOP
   */
  const filteredStories = React.useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = isTop
      ? (() => {
          const end = new Date(selectedDate);
          end.setHours(23, 59, 59, 999);
          const endMs = end.getTime();

          return stories.filter((s: any) => {
            const ms = getStoryTimeMs(s);
            if (ms == null) return true;
            return ms <= endMs;
          });
        })()
      : stories;

    if (!q) return base;

    return base.filter((s: any) => (s?.title ?? "").toLowerCase().includes(q));
  }, [stories, isTop, selectedDate, search]);

  const prefetchLockRef = React.useRef(false);

  React.useEffect(() => {
    if (!isTop) return;
    if (isLoading) return;
    if (!hasNextPage) return;

    const end = new Date(selectedDate);
    end.setHours(23, 59, 59, 999);
    const endMs = end.getTime();

    if (hasAnyStoryAtOrBeforeDate(stories as any[], endMs)) return;

    if (prefetchLockRef.current) return;
    prefetchLockRef.current = true;

    let cancelled = false;

    (async () => {
      try {
        const MAX_PAGES = 30;

        for (let i = 0; i < MAX_PAGES; i++) {
          if (cancelled) return;

          const result = await fetchNextPage();
          const nextStories =
            result?.data?.pages?.flatMap((p: any) => p?.stories ?? []) ?? [];

          if (hasAnyStoryAtOrBeforeDate(nextStories, endMs)) return;

          if (
            result &&
            "hasNextPage" in result &&
            (result as any).hasNextPage === false
          ) {
            return;
          }
        }
      } finally {
        prefetchLockRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      prefetchLockRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTop, selectedDate, feedKind]);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "300px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const showEmpty =
    !isLoading &&
    filteredStories.length === 0 &&
    (!isTop || (!hasNextPage && !isFetchingNextPage));

  return (
    <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
      <Stack spacing={2}>
        <BlogFiltersBar
          feedKind={feedKind}
          search={search}
          selectedDate={selectedDate}
          onFeedKindChange={setFeedKind}
          onSearchChange={setSearch}
          onSelectedDateChange={setSelectedDate}
        />

        {isLoading ? (
          <StoriesSkeleton />
        ) : showEmpty ? (
          <Typography sx={{ textAlign: "center", opacity: 0.8, mt: 4 }}>
            No stories found.
          </Typography>
        ) : filteredStories.length === 0 && isTop ? (
          <Typography sx={{ textAlign: "center", opacity: 0.8, mt: 4 }}>
            Loading older stories…
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {filteredStories.map((story: any, index: number) => (
              <StoryCard
                key={getStoryIdNumber(story, index)}
                story={story}
                index={index}
                onOpenComments={onOpenComments}
              />
            ))}
            <div ref={sentinelRef} />
          </Stack>
        )}

        {isFetchingNextPage && (
          <Typography sx={{ textAlign: "center", opacity: 0.6 }}>
            Loading more…
          </Typography>
        )}

        <CommentsDialog
          open={commentsOpen}
          story={selectedStory}
          onClose={onCloseComments}
        />
      </Stack>
    </Box>
  );
}
