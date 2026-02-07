import { useInfiniteQuery } from "@tanstack/react-query";
import { getItem, getStoryIds } from "../api/queries";
import { HNStory } from "../types";
import { FeedKind } from "../types";

const PAGE_SIZE = 20;

export function useStoriesInfinite(kind: FeedKind) {
  return useInfiniteQuery({
    queryKey: ["stories", kind],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const ids = await getStoryIds(kind);
      const slice = ids.slice(pageParam, pageParam + PAGE_SIZE);

      const items = await Promise.all(slice.map((id) => getItem<HNStory>(id)));

      const stories = items.filter(
        (x): x is HNStory => !!x && typeof x.title === "string",
      );

      const nextOffset = pageParam + PAGE_SIZE;
      return {
        stories,
        nextOffset: nextOffset < ids.length ? nextOffset : null,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    staleTime: 30_000,
  });
}
