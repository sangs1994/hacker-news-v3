import * as React from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { HNStory } from "../../../types/index";
import { hostFromUrl } from "../utils/url";

type Props = {
  isLoading: boolean;
  isError: boolean;
  data?: HNStory[];
};

function BestPickCard({ item }: { item: HNStory }) {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography sx={{ fontWeight: 800 }} noWrap>
          {item.title}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {hostFromUrl(item.url)}
          {item.score ?? 0} points •{" "}
          {new Date(item.time * 1000).toLocaleDateString()}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function BestPicks({ isLoading, isError, data }: Props) {
  return (
    <Box sx={{ width: 360 }}>
      <Stack spacing={1.25} sx={{ position: "sticky", top: 16 }}>
        <Box>
          <Typography sx={{ fontWeight: 800 }}>Best Picks</Typography>
          <Typography variant="body2" color="text.secondary">
            Curated stories
          </Typography>
        </Box>

        <Divider />

        {isLoading && (
          <Stack alignItems="center" sx={{ py: 4 }}>
            <CircularProgress size={22} />
          </Stack>
        )}

        {isError && (
          <Typography color="error" variant="body2">
            Failed to load best picks.
          </Typography>
        )}

        {!isLoading && !isError && (
          <Stack spacing={1.25}>
            {(data ?? []).map((item) => (
              <BestPickCard key={item.id} item={item} />
            ))}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
