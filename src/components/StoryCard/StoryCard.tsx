import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import type { HNStory } from "../../types/index";
import { hostFromUrl } from "../../features/news/utils/url";
import { timeAgo } from "../../features/news/utils/time";

type Props = {
  story: HNStory;
  index: number;
  onOpenComments: (storyId: number) => void;
};

export default function StoryCard({ story, index, onOpenComments }: Props) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ display: "flex", gap: 2 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography sx={{ fontWeight: 800 }} noWrap>
              {index}. {story.title}
            </Typography>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ marginLeft: "auto" }}
            >
              {hostFromUrl(story.url)}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1.25 }}
          >
            {typeof story.score === "number" && (
              <Typography variant="caption" color="text.secondary">
                {story.score} points
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              by {story.by} • {timeAgo(story.time)}
            </Typography>

            <Button
              size="small"
              variant="outlined"
              sx={{ borderRadius: 2, textTransform: "none" }}
              onClick={() => onOpenComments(story.id)}
            >
              Comments ({story.descendants ?? 0})
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
