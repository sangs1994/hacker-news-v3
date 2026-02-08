import { useQuery } from "@tanstack/react-query";
import { getTopLevelComments } from "../services/queries";

export function useComments(storyId: number | null, open: boolean) {
  return useQuery({
    queryKey: ["comments", storyId],
    enabled: open && !!storyId,
    queryFn: () => getTopLevelComments(storyId!, 20),
  });
}
