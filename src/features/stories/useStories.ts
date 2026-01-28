import { useQuery } from "@tanstack/react-query";
import {
  getTopStoryIds,
  getNewStoryIds,
  getStoryById,
  Story,
} from "../../api/Endpoints";

export function useStoryIds(type: "top" | "new") {
  return useQuery({
    queryKey: ["storyIds", type],
    queryFn: () => (type === "top" ? getTopStoryIds() : getNewStoryIds()),
    staleTime: 60_000,
  });
}

export function useStoryDetails(ids: number[] | undefined) {
  return useQuery({
    queryKey: ["stories", ids],
    enabled: !!ids?.length,
    queryFn: async (): Promise<Story[]> => {
      const stories = await Promise.all(ids!.map(getStoryById));
      return stories.filter(Boolean);
    },
  });
}
