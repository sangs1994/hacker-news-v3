import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";
import type { HNStory } from "../../types/index";
import { hostFromUrl } from "../../utils/url";
import { timeAgo } from "../../utils/time";
import { useComments } from "../../hooks/useComments";

export default function CommentsDialog({
  open,
  story,
  onClose,
}: {
  open: boolean;
  story: HNStory | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const storyId = story?.id ?? null;

  const commentsQuery = useComments(storyId, open);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800 }}>Comments</Typography>
          {story && (
            <Typography variant="caption" color="text.secondary" noWrap>
              {story.title} • {hostFromUrl(story.url)} •{" "}
              {story.descendants ?? 0} comments
            </Typography>
          )}
        </Box>

        <IconButton onClick={onClose} aria-label="Close comments">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ bgcolor: "grey.50" }}>
        {commentsQuery.isLoading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
            <CircularProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Loading comments…
            </Typography>
          </Stack>
        )}

        {commentsQuery.isError && (
          <Typography color="error">
            Failed to load comments. Please try again.
          </Typography>
        )}

        {!commentsQuery.isLoading && !commentsQuery.isError && (
          <Stack spacing={1.5}>
            {(commentsQuery.data ?? []).map((c) => (
              <Card key={c.id} variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 700 }}
                  >
                    {c.by ?? "unknown"} • {c.time ? timeAgo(c.time) : ""}
                  </Typography>

                  <Box
                    sx={{ mt: 1, "& a": { color: "primary.main" } }}
                    dangerouslySetInnerHTML={{ __html: c.text ?? "" }}
                  />
                </CardContent>
              </Card>
            ))}

            {(!commentsQuery.data || commentsQuery.data.length === 0) && (
              <Typography color="text.secondary">No comments found.</Typography>
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
