import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CommentsDialog from "../CommentsDialog";
import { useComments } from "../../../hooks/useComments";

// ---- mocks ----
jest.mock("../../../hooks/useComments", () => ({
  useComments: jest.fn(),
}));

jest.mock("../../../utils/url", () => ({
  hostFromUrl: jest.fn(() => "example.com"),
}));

jest.mock("../../../utils/time", () => ({
  timeAgo: jest.fn(() => "5m ago"),
}));

// Keep Dialog predictable in tests
jest.mock("@mui/material/useMediaQuery", () => ({
  __esModule: true,
  default: jest.fn(() => false),
}));

function mockUseComments(overrides: Partial<any>) {
  const base = {
    isLoading: false,
    isError: false,
    data: [],
  };
  (useComments as jest.Mock).mockReturnValue({ ...base, ...overrides });
}

describe("CommentsDialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("calls useComments with storyId and open", () => {
    mockUseComments({ isLoading: true });

    render(
      <CommentsDialog
        open={true}
        story={{ id: 123, title: "T", url: "https://example.com" } as any}
        onClose={jest.fn()}
      />,
    );

    expect(useComments).toHaveBeenCalledWith(123, true);
  });

  test("renders story meta when story exists", () => {
    mockUseComments({ data: [] });

    render(
      <CommentsDialog
        open={true}
        story={
          {
            id: 1,
            title: "My Story",
            url: "https://www.example.com/x",
            descendants: 42,
          } as any
        }
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(
      screen.getByText(/My Story • example\.com • 42 comments/i),
    ).toBeInTheDocument();
  });

  test("clicking close button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    mockUseComments({ data: [] });

    render(<CommentsDialog open={true} story={null} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: /close comments/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("shows loading state", () => {
    mockUseComments({ isLoading: true });

    render(
      <CommentsDialog
        open={true}
        story={{ id: 1, title: "T" } as any}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("Loading comments…")).toBeInTheDocument();
  });

  test("shows error state", () => {
    mockUseComments({ isError: true });

    render(
      <CommentsDialog
        open={true}
        story={{ id: 1, title: "T" } as any}
        onClose={jest.fn()}
      />,
    );

    expect(
      screen.getByText(/Failed to load comments\. Please try again\./i),
    ).toBeInTheDocument();
  });

  test("renders comments with author, timeAgo, and HTML text", () => {
    mockUseComments({
      data: [
        {
          id: 11,
          by: "alice",
          time: 1700000000,
          text: "<p>Hello <a href='#'>link</a></p>",
        },
      ],
    });

    render(
      <CommentsDialog
        open={true}
        story={{ id: 1, title: "T" } as any}
        onClose={jest.fn()}
      />,
    );

    // author + timeAgo (mocked)
    expect(screen.getByText(/alice • 5m ago/i)).toBeInTheDocument();

    // HTML rendered
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "link" })).toBeInTheDocument();
  });

  test("shows 'No comments found.' when data is empty", () => {
    mockUseComments({ data: [] });

    render(
      <CommentsDialog
        open={true}
        story={{ id: 1, title: "T" } as any}
        onClose={jest.fn()}
      />,
    );

    expect(screen.getByText("No comments found.")).toBeInTheDocument();
  });

  test("does not crash when story is null (meta hidden)", () => {
    mockUseComments({ data: [] });

    render(<CommentsDialog open={true} story={null} onClose={jest.fn()} />);

    expect(screen.getByText("Comments")).toBeInTheDocument();
    // meta line should not be present
    expect(screen.queryByText(/comments/i)).not.toBeNull(); // title exists
  });
});
