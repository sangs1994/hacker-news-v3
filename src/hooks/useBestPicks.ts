import { useQuery } from "@tanstack/react-query";
import { getBestPicks } from "../api/queries";

/**
 * Replace getBestPicks with your own "Best Picks API" call.
 * If you don’t have it yet, you can temporarily reuse top stories.
 */
export function useBestPicks() {
  return useQuery({
    queryKey: ["bestPicks"],
    queryFn: () => getBestPicks(),
    staleTime: 60_000,
  });
}
