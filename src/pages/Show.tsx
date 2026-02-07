import * as React from "react";
import { Container, Box, Typography, Link } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import StoryCard from "../components/StoryCard/StoryCard";
import { StoriesSkeleton } from "../components/StoryCard/StoryCardSkeleton";
import CommentsDialog from "../components/CommentsDialog/CommentsDialog";
import { useStoriesInfinite } from "../hooks/useStoriesInfinite";
import { HNStory } from "../types";

export default function ShowPage() {
  const [params] = useSearchParams();
  const query = (params.get("q") ?? "").trim().toLowerCase();

  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useStoriesInfinite("show");

  const stories = React.useMemo<HNStory[]>(() => {
    return data?.pages.flatMap((p) => p.stories) ?? [];
  }, [data]);

  const filteredStories = React.useMemo(() => {
    if (!query) return stories;
    return stories.filter((s) => {
      const title = (s.title ?? "").toLowerCase();
      const url = (s.url ?? "").toLowerCase();
      return title.includes(query) || url.includes(query);
    });
  }, [stories, query]);

  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [activeStory, setActiveStory] = React.useState<HNStory | null>(null);

  const openComments = React.useCallback(
    (storyId: number) => {
      const story = stories.find((s) => s.id === storyId) ?? null;
      setActiveStory(story);
      setCommentsOpen(true);
    },
    [stories],
  );

  const closeComments = React.useCallback(() => {
    setCommentsOpen(false);
    setActiveStory(null);
  }, []);

  const sentinelRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "600px" },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <Container maxWidth={false} disableGutters>
      <Box sx={{ px: { xs: 2, md: 3 }, py: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Show HN
        </Typography>

        {/* Info banner */}
        <Box
          sx={{
            mb: 3,
            px: 2,
            py: 1.5,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Please read the{" "}
            <Link
              href="https://news.ycombinator.com/showhn.html"
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
            >
              Show HN rules and tips
            </Link>{" "}
            before posting.
          </Typography>
        </Box>

        {isLoading && <StoriesSkeleton count={6} />}

        {isError && (
          <Box
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
            }}
          >
            <Typography sx={{ fontWeight: 700 }}>
              Failed to load Show stories
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              {error instanceof Error ? error.message : "Unknown error"}
            </Typography>
          </Box>
        )}

        {!isLoading && !isError && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredStories.map((story, i) => (
              <StoryCard
                key={story.id}
                story={story}
                index={i + 1}
                onOpenComments={openComments}
              />
            ))}

            {/* sentinel */}
            <div ref={sentinelRef} />

            {isFetchingNextPage && <StoriesSkeleton count={3} />}
          </Box>
        )}

        <CommentsDialog
          open={commentsOpen}
          story={activeStory}
          onClose={closeComments}
        />
      </Box>
    </Container>
  );
}
