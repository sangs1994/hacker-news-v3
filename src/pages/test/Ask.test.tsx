import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AskPage from "../Ask";
import { useStoriesInfinite } from "../../hooks/useStoriesInfinite";

// ---- Mocks ----
jest.mock("../../hooks/useStoriesInfinite", () => ({
  useStoriesInfinite: jest.fn(),
}));

// Mock StoryCard so we can assert order + trigger openComments
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

// Skeleton mock
jest.mock("../../components/StoryCard/StoryCardSkeleton", () => ({
  StoriesSkeleton: ({ count }: { count: number }) => (
    <div data-testid="skeleton">Skeleton {count}</div>
  ),
}));

// Comments dialog mock
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

// Control query param (?q=...)
const mockUseSearchParams = jest.fn();
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: () => mockUseSearchParams(),
  };
});

// IntersectionObserver mock for infinite scroll
class IO {
  cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe() {}
  disconnect() {}
}
beforeAll(() => {
  // @ts-expect-error
  global.IntersectionObserver = IO;
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

describe("AskPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSearchQuery(""); // default no filter
  });

  test("renders title and info banner", () => {
    mockStoriesInfiniteReturn({
      data: { pages: [{ stories: [] }] },
    });

    render(<AskPage />);

    expect(screen.getByText("Ask HN")).toBeInTheDocument();
    expect(
      screen.getByText(/Ask HN is for questions to the Hacker News community/i),
    ).toBeInTheDocument();
  });

  test("shows skeleton while loading", () => {
    mockStoriesInfiniteReturn({ isLoading: true });

    render(<AskPage />);

    expect(screen.getByTestId("skeleton")).toHaveTextContent("Skeleton 6");
  });

  test("shows error state", () => {
    mockStoriesInfiniteReturn({
      isError: true,
      error: new Error("Boom"),
    });

    render(<AskPage />);

    expect(screen.getByText("Failed to load Ask stories")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  test("calls useStoriesInfinite with 'ask'", () => {
    mockStoriesInfiniteReturn();

    render(<AskPage />);

    expect(useStoriesInfinite).toHaveBeenCalledWith("ask");
  });

  test("renders stories and passes correct index numbers", () => {
    const stories = [
      { id: 1, title: "First", time: 200 },
      { id: 2, title: "Second", time: 100 },
    ];
    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<AskPage />);

    const cards = screen.getAllByTestId("story-card");
    expect(cards).toHaveLength(2);

    const indices = screen
      .getAllByTestId("story-index")
      .map((n) => n.textContent);
    expect(indices).toEqual(["1", "2"]);
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

    render(<AskPage />);

    // Default is Latest -> order should be as given (Newer then Older)
    let titles = screen.getAllByTestId("story-title").map((n) => n.textContent);
    expect(titles).toEqual(["Newer", "Older"]);

    // Switch to Oldest
    await user.click(screen.getByRole("button", { name: "Oldest" }));

    titles = screen.getAllByTestId("story-title").map((n) => n.textContent);
    expect(titles).toEqual(["Older", "Newer"]);
  });

  test("filters by query param ?q= (matches title)", () => {
    setSearchQuery("react");

    const stories = [
      { id: 1, title: "React Query tips", url: "https://x.com", time: 1 },
      { id: 2, title: "Angular stuff", url: "https://y.com", time: 2 },
    ];
    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<AskPage />);

    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["React Query tips"]);
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

    render(<AskPage />);

    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["Match by url"]);
  });

  test("opens CommentsDialog with the correct story when StoryCard triggers onOpenComments", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 10, title: "Story A", time: 10 },
      { id: 20, title: "Story B", time: 20 },
    ];
    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<AskPage />);

    // Initially closed
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("none");

    // Click "Open comments" on Story B
    const openButtons = screen.getAllByRole("button", {
      name: "Open comments",
    });
    await user.click(openButtons[1]);

    expect(screen.getByTestId("comments-open")).toHaveTextContent("true");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("Story B");

    // Close
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("none");
  });

  test("infinite scroll triggers fetchNextPage when sentinel intersects", () => {
    const fetchNextPage = jest.fn();
    mockStoriesInfiniteReturn({
      data: { pages: [{ stories: [{ id: 1, title: "X", time: 1 }] }] },
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    // Spy on IntersectionObserver so we can invoke the callback
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

    render(<AskPage />);

    // Trigger intersection
    ioInstances[0].cb([{ isIntersecting: true }]);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test("does NOT fetchNextPage when already fetching or no next page", () => {
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
      data: { pages: [{ stories: [{ id: 1, title: "X", time: 1 }] }] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(<AskPage />);
    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();

    jest.clearAllMocks();
    ioInstances.length = 0;

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories: [{ id: 1, title: "X", time: 1 }] }] },
      hasNextPage: true,
      isFetchingNextPage: true,
      fetchNextPage,
    });

    render(<AskPage />);
    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
