import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import JobsPage from "../Jobs";
import { useStoriesInfinite } from "../../hooks/useStoriesInfinite";

// ---- Mocks ----
jest.mock("../../hooks/useStoriesInfinite", () => ({
  useStoriesInfinite: jest.fn(),
}));

jest.mock("../../components/StoryCard/StoryCard", () => {
  return function StoryCardMock(props: any) {
    const { story, index, onOpenComments } = props;
    return (
      <div data-testid="story-card">
        <div data-testid="story-index">{index}</div>
        <div data-testid="story-title">{story.title}</div>
        <button onClick={() => onOpenComments(story.id)}>Open comments</button>
      </div>
    );
  };
});

jest.mock("../../components/StoryCard/StoryCardSkeleton", () => ({
  StoriesSkeleton: ({ count }: { count: number }) => (
    <div data-testid="skeleton">Skeleton {count}</div>
  ),
}));

jest.mock("../../components/CommentsDialog/CommentsDialog", () => {
  return function CommentsDialogMock(props: any) {
    const { open, story, onClose } = props;
    return (
      <div data-testid="comments-dialog">
        <div data-testid="comments-open">{String(open)}</div>
        <div data-testid="comments-story">{story?.title ?? "none"}</div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  };
});

// search params mock (?q=...)
const mockUseSearchParams = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => mockUseSearchParams(),
  };
});

function setSearchQuery(q: string) {
  mockUseSearchParams.mockReturnValue([
    new URLSearchParams(q ? `q=${encodeURIComponent(q)}` : ""),
  ]);
}

function mockStoriesInfiniteReturn(overrides: Partial<any> = {}) {
  const base = {
    data: { pages: [{ stories: [] }] },
    isLoading: false,
    isError: false,
    error: null,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  };
  (useStoriesInfinite as jest.Mock).mockReturnValue({ ...base, ...overrides });
  return (useStoriesInfinite as jest.Mock).mock.results.at(-1)?.value;
}

describe("JobsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSearchQuery("");
  });

  test("renders title and info banner", () => {
    mockStoriesInfiniteReturn();

    render(<JobsPage />);

    expect(screen.getByText("Jobs")).toBeInTheDocument();
    expect(
      screen.getByText(/Browse Hacker News job listings here/i),
    ).toBeInTheDocument();
  });

  test("calls useStoriesInfinite with 'job'", () => {
    mockStoriesInfiniteReturn();

    render(<JobsPage />);

    expect(useStoriesInfinite).toHaveBeenCalledWith("job");
  });

  test("shows skeleton while loading", () => {
    mockStoriesInfiniteReturn({ isLoading: true });

    render(<JobsPage />);

    expect(screen.getByTestId("skeleton")).toHaveTextContent("Skeleton 6");
  });

  test("shows error state", () => {
    mockStoriesInfiniteReturn({
      isError: true,
      error: new Error("Boom"),
    });

    render(<JobsPage />);

    expect(screen.getByText("Failed to load Jobs")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  test("renders stories and index numbers", () => {
    const stories = [
      { id: 1, title: "Job A", time: 200 },
      { id: 2, title: "Job B", time: 100 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<JobsPage />);

    expect(screen.getAllByTestId("story-card")).toHaveLength(2);
    expect(
      screen.getAllByTestId("story-index").map((n) => n.textContent),
    ).toEqual(["1", "2"]);
  });

  test("sorts by oldest when Oldest is selected (time ascending)", async () => {
    const user = userEvent.setup();
    const stories = [
      { id: 1, title: "Newer", time: 200 },
      { id: 2, title: "Older", time: 100 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<JobsPage />);

    // default order
    let titles = screen.getAllByTestId("story-title").map((n) => n.textContent);
    expect(titles).toEqual(["Newer", "Older"]);

    await user.click(screen.getByRole("button", { name: "Oldest" }));

    titles = screen.getAllByTestId("story-title").map((n) => n.textContent);
    expect(titles).toEqual(["Older", "Newer"]);
  });

  test("filters by query param ?q= (matches title)", () => {
    setSearchQuery("engineer");

    const stories = [
      { id: 1, title: "Senior Engineer Dublin", url: "https://x.com", time: 1 },
      { id: 2, title: "Designer role", url: "https://y.com", time: 2 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<JobsPage />);

    expect(
      screen.getAllByTestId("story-title").map((n) => n.textContent),
    ).toEqual(["Senior Engineer Dublin"]);
  });

  test("filters by query param ?q= (matches url)", () => {
    setSearchQuery("example.com");

    const stories = [
      { id: 1, title: "No match", url: "https://nope.com", time: 1 },
      {
        id: 2,
        title: "Match by url",
        url: "https://example.com/post",
        time: 2,
      },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<JobsPage />);

    expect(
      screen.getAllByTestId("story-title").map((n) => n.textContent),
    ).toEqual(["Match by url"]);
  });

  test("does NOT open CommentsDialog for jobs without comments (kids missing/empty)", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 1, title: "Job without kids", time: 1, kids: [] },
      { id: 2, title: "Job missing kids", time: 2 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<JobsPage />);

    // Initially closed
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");

    // Click open comments on story 1 (kids empty)
    await user.click(
      screen.getAllByRole("button", { name: "Open comments" })[0],
    );
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");

    // Click open comments on story 2 (kids missing)
    await user.click(
      screen.getAllByRole("button", { name: "Open comments" })[1],
    );
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
  });

  test("opens CommentsDialog ONLY when job has kids", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 1, title: "Job with comments", time: 1, kids: [101] },
      { id: 2, title: "Job no comments", time: 2, kids: [] },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<JobsPage />);

    // Click open comments for story with kids
    await user.click(
      screen.getAllByRole("button", { name: "Open comments" })[0],
    );

    expect(screen.getByTestId("comments-open")).toHaveTextContent("true");
    expect(screen.getByTestId("comments-story")).toHaveTextContent(
      "Job with comments",
    );

    // Close
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
  });

  test("infinite scroll triggers fetchNextPage when sentinel intersects", () => {
    const fetchNextPage = jest.fn();

    const ioInstances: any[] = [];
    // @ts-expect-error
    global.IntersectionObserver = class {
      cb: any;
      constructor(cb: any) {
        this.cb = cb;
        ioInstances.push(this);
      }
      observe() {}
      disconnect() {}
    };

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories: [{ id: 1, title: "Job A", time: 1 }] }] },
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(<JobsPage />);

    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test("does NOT fetchNextPage when no next page OR already fetching", () => {
    const fetchNextPage = jest.fn();

    const ioInstances: any[] = [];
    // @ts-expect-error
    global.IntersectionObserver = class {
      cb: any;
      constructor(cb: any) {
        this.cb = cb;
        ioInstances.push(this);
      }
      observe() {}
      disconnect() {}
    };

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories: [{ id: 1, title: "Job A", time: 1 }] }] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(<JobsPage />);
    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();

    jest.clearAllMocks();
    ioInstances.length = 0;

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories: [{ id: 1, title: "Job A", time: 1 }] }] },
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage,
    });

    render(<JobsPage />);
    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
