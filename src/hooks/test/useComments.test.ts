import { waitFor } from "@testing-library/react";
import { useComments } from "../useComments";
import { renderHookWithQueryClient } from "../../test/reactQueryTestUtils";
import { getTopLevelComments } from "../../services/queries";

jest.mock("../../services/queries", () => ({
  getTopLevelComments: jest.fn(),
}));

describe("useComments", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test("does NOT fetch when open is false", async () => {
    (getTopLevelComments as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const { result } = renderHookWithQueryClient(() => useComments(123, false));

    // React Query reports idle when disabled (or fetchStatus idle)
    expect(result.current.fetchStatus).toBe("idle");
    expect(getTopLevelComments).not.toHaveBeenCalled();
  });

  test("does NOT fetch when storyId is null even if open is true", async () => {
    (getTopLevelComments as jest.Mock).mockResolvedValue([{ id: 1 }]);

    const { result } = renderHookWithQueryClient(() => useComments(null, true));

    expect(result.current.fetchStatus).toBe("idle");
    expect(getTopLevelComments).not.toHaveBeenCalled();
  });

  test("fetches comments when open=true and storyId exists", async () => {
    const mockComments = [
      { id: 1001, text: "Hello" },
      { id: 1002, text: "World" },
    ];

    (getTopLevelComments as jest.Mock).mockResolvedValue(mockComments);

    const { result } = renderHookWithQueryClient(() => useComments(456, true));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(getTopLevelComments).toHaveBeenCalledTimes(1);
    expect(getTopLevelComments).toHaveBeenCalledWith(456, 20);
    expect(result.current.data).toEqual(mockComments);
  });

  test("handles error state", async () => {
    (getTopLevelComments as jest.Mock).mockRejectedValue(
      new Error("Comments failed"),
    );

    const { result } = renderHookWithQueryClient(() => useComments(999, true));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(getTopLevelComments).toHaveBeenCalledTimes(1);
    expect(getTopLevelComments).toHaveBeenCalledWith(999, 20);
    expect(result.current.error).toBeInstanceOf(Error);
  });
});
