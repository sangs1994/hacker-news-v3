import { waitFor } from "@testing-library/react";
import { useBestPicks } from "../useBestPicks";
import { renderHookWithQueryClient } from "../../test/reactQueryTestUtils";
import { getBestPicks } from "../../services/queries";

jest.mock("../../services/queries", () => ({
  getBestPicks: jest.fn(),
}));

describe("useBestPicks", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("fetches and returns best picks data", async () => {
    const mockData = [
      { id: 1, title: "Best Story 1" },
      { id: 2, title: "Best Story 2" },
    ];

    (getBestPicks as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHookWithQueryClient(() => useBestPicks());

    // initially loading
    expect(result.current.isLoading).toBe(true);

    // wait for success
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(getBestPicks).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(mockData);
  });

  test("handles error state", async () => {
    (getBestPicks as jest.Mock).mockRejectedValue(new Error("API failed"));

    const { result } = renderHookWithQueryClient(() => useBestPicks());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(getBestPicks).toHaveBeenCalledTimes(1);
  });
});
