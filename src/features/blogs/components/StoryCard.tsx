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
import type { HNStory } from "../../../types/index";
import { hostFromUrl } from "../utils/url";
import { timeAgo } from "../utils/time";

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

          {/* Optional description placeholder */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Short excerpt / summary can be added here (optional).
          </Typography>

          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mt: 1.25 }}
          >
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

            {typeof story.score === "number" && (
              <Chip
                size="small"
                label={`${story.score} points`}
                sx={{ ml: "auto", borderRadius: 2 }}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        {/* Placeholder image block – since HN doesn’t provide images */}
        <CardMedia
          sx={{
            width: 150,
            height: 86,
            borderRadius: 2,
            bgcolor: "grey.200",
            flexShrink: 0,
          }}
        />
      </CardContent>
    </Card>
  );
}
