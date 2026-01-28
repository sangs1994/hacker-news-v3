import { useQuery } from "@tanstack/react-query";
import type { FeedKind } from "../../../types/index";
import { getStories } from "../../../api/queries";

export function useStories(kind: FeedKind, limit = 30) {
  return useQuery({
    queryKey: ["stories", kind, limit],
    queryFn: () => getStories(kind, limit),
    staleTime: 30_000,
  });
}
