import { waitFor } from "@testing-library/react";
import { renderHookWithQueryClient } from "../../test/reactQueryTestUtils";
import { useStoriesInfinite } from "../useStoriesInfinite";
import { getItem, getStoryIds } from "../../services/queries";
import type { HNStory } from "../../types";
import type { FeedKind } from "../../types";

jest.mock("../../services/queries", () => ({
  getStoryIds: jest.fn(),
  getItem: jest.fn(),
}));

function makeStory(id: number): HNStory {
  return {
    id,
    title: `Story ${id}`,
    by: "tester",
    time: 1700000000,
    score: 1,
    type: "story",
    url: "https://example.com",
  } as unknown as HNStory;
}

describe("useStoriesInfinite", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches first page (20) and next page (20), and filters invalid items", async () => {
    const kind: FeedKind = "top";

    // 45 ids => pages: 20 + 20 + 5
    const ids = Array.from({ length: 45 }, (_, i) => i + 1);

    (getStoryIds as jest.Mock).mockResolvedValue(ids);

    // Make getItem return:
    // - valid story for most
    // - invalid for a couple (null and missing title)
    (getItem as jest.Mock).mockImplementation(async (id: number) => {
      if (id === 3) return null; // invalid
      if (id === 7) return { id, by: "x" }; // missing title => invalid
      return makeStory(id);
    });

    const { result } = renderHookWithQueryClient(() =>
      useStoriesInfinite(kind),
    );

    // Wait for first page
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Assert getStoryIds called
    expect(getStoryIds).toHaveBeenCalledTimes(1);
    expect(getStoryIds).toHaveBeenCalledWith(kind);

    // First page should be 20 ids, but 2 invalid filtered out => 18 stories
    const firstPageStories = result.current.data?.pages[0].stories ?? [];
    expect(firstPageStories).toHaveLength(18);

    // Next page exists (because 45 ids)
    expect(result.current.hasNextPage).toBe(true);

    // Fetch next page
    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(2);
    });

    const secondPageStories = result.current.data?.pages[1].stories ?? [];
    // Second page has ids 21..40 => all valid => 20
    expect(secondPageStories).toHaveLength(20);

    // Fetch third (last) page
    await result.current.fetchNextPage();

    await waitFor(() => {
      expect(result.current.data?.pages.length).toBe(3);
    });

    const thirdPageStories = result.current.data?.pages[2].stories ?? [];
    // Third page has ids 41..45 => 5
    expect(thirdPageStories).toHaveLength(5);

    // Now should have no next page
    expect(result.current.hasNextPage).toBe(false);

    // getItem should have been called for all ids that were attempted:
    // first 20 + second 20 + last 5 = 45
    expect(getItem).toHaveBeenCalledTimes(45);
  });

  test("handles error when getStoryIds fails", async () => {
    (getStoryIds as jest.Mock).mockRejectedValue(new Error("ids failed"));

    const { result } = renderHookWithQueryClient(() =>
      useStoriesInfinite("new"),
    );

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getStoryIds).toHaveBeenCalledTimes(1);
    expect(getItem).not.toHaveBeenCalled();
  });
});
