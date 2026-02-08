import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Divider,
  Button,
} from "@mui/material";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ShowHNRulesDialog({ open, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Show HN — Rules & Tips</DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Show HN is for something you&apos;ve made that other people can try.
            The community can give feedback and ask questions in the thread.
          </Typography>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>On-topic</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Things people can run on their computers or hold in their hands.
              For hardware, a video or detailed article is fine. For books, a
              sample chapter is okay.
            </Typography>
          </Box>

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>Off-topic</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Blog posts, sign-up pages, newsletters, lists, and other
              reading-only material. If it can&apos;t be tried out, it
              can&apos;t be a Show HN.
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography sx={{ fontWeight: 800, mb: 0.5 }}>
              Best practices
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.2 }}>
              <li>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Make it easy for users to try your thing without barriers like
                  signups or emails.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Be around to discuss and answer questions.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Don&apos;t ask friends to upvote or comment.
                </Typography>
              </li>
              <li>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Major overhauls are okay; small updates usually aren&apos;t.
                </Typography>
              </li>
            </Box>
          </Box>

          <Divider />

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            For full details, see the official Show HN page.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          onClick={() =>
            window.open(
              "https://news.ycombinator.com/showhn.html",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          Open Official Page
        </Button>
      </DialogActions>
    </Dialog>
  );
}
