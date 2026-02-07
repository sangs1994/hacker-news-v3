import * as React from "react";
import { Box, Typography, Link } from "@mui/material";
import { useSearchParams } from "react-router-dom";

import { useStories } from "../hooks/useStories";
import StoryCard from "../components/StoryCard/StoryCard";
import { StoriesSkeleton } from "../components/StoryCard/StoryCardSkeleton";
import { HNStory } from "../types";

export default function ShowPage() {
  const [params] = useSearchParams();
  const q = (params.get("q") ?? "").trim().toLowerCase();

  const [commentsOpen, setCommentsOpen] = React.useState(false);
  const [activeStory, setActiveStory] = React.useState<HNStory | null>(null);

  const { data, isLoading, isError, error } = useStories("show", 30);

  const filtered = React.useMemo(() => {
    if (!data) return [];
    if (!q) return data;
    return data.filter((s) => {
      const title = (s.title ?? "").toLowerCase();
      const url = (s.url ?? "").toLowerCase();
      return title.includes(q) || url.includes(q);
    });
  }, [data, q]);

  const openComments = (storyId: number) => {
    const story = (data ?? []).find((s) => s.id === storyId) ?? null;
    setActiveStory(story);
    setCommentsOpen(true);
  };

  return (
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
          </Link>
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
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {error instanceof Error ? error.message : "Unknown error"}
          </Typography>
        </Box>
      )}

      {!isLoading && !isError && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {filtered.map((story, i) => (
            <StoryCard
              key={story.id}
              story={story}
              index={i + 1}
              onOpenComments={openComments}
            />
          ))}
        </Box>
      )}
    </Box>
  );
}
