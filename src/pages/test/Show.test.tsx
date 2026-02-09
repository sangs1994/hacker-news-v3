import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShowPage from "../Show";
import { useStoriesInfinite } from "../../hooks/useStoriesInfinite";

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

jest.mock("../../components/ShowHNRules/ShowHNRules", () => {
  return function ShowHNRulesDialogMock(props: any) {
    const { open, onClose } = props;
    return (
      <div data-testid="rules-dialog">
        <div data-testid="rules-open">{String(open)}</div>
        <button onClick={onClose}>Close rules</button>
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

describe("ShowPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setSearchQuery("");
  });

  test("renders title and info banner", () => {
    mockStoriesInfiniteReturn();

    render(<ShowPage />);

    expect(screen.getByText("Show HN")).toBeInTheDocument();
    expect(screen.getByText(/Please read the/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Show HN rules and tips/i }),
    ).toBeInTheDocument();
  });

  test("opens and closes ShowHNRulesDialog when link is clicked", async () => {
    const user = userEvent.setup();
    mockStoriesInfiniteReturn();

    render(<ShowPage />);

    // initially closed
    expect(screen.getByTestId("rules-open")).toHaveTextContent("false");

    await user.click(
      screen.getByRole("button", { name: /Show HN rules and tips/i }),
    );
    expect(screen.getByTestId("rules-open")).toHaveTextContent("true");

    await user.click(screen.getByRole("button", { name: "Close rules" }));
    expect(screen.getByTestId("rules-open")).toHaveTextContent("false");
  });

  test("shows skeleton while loading", () => {
    mockStoriesInfiniteReturn({ isLoading: true });

    render(<ShowPage />);
    expect(screen.getByTestId("skeleton")).toHaveTextContent("Skeleton 6");
  });

  test("shows error state", () => {
    mockStoriesInfiniteReturn({ isError: true, error: new Error("Boom") });

    render(<ShowPage />);
    expect(screen.getByText("Failed to load Show stories")).toBeInTheDocument();
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  test("calls useStoriesInfinite with 'show'", () => {
    mockStoriesInfiniteReturn();
    render(<ShowPage />);
    expect(useStoriesInfinite).toHaveBeenCalledWith("show");
  });

  test("renders stories and supports sorting by oldest", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 1, title: "Newer", time: 200 },
      { id: 2, title: "Older", time: 100 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<ShowPage />);

    // default latest => given order
    let titles = screen.getAllByTestId("story-title").map((n) => n.textContent);
    expect(titles).toEqual(["Newer", "Older"]);

    await user.click(screen.getByRole("button", { name: "Oldest" }));
    titles = screen.getAllByTestId("story-title").map((n) => n.textContent);
    expect(titles).toEqual(["Older", "Newer"]);
  });

  test("filters by query param ?q= (matches title)", () => {
    setSearchQuery("react");

    const stories = [
      { id: 1, title: "React Query demo", url: "https://x.com", time: 1 },
      { id: 2, title: "Angular", url: "https://y.com", time: 2 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<ShowPage />);

    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["React Query demo"]);
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

    render(<ShowPage />);

    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["Match by url"]);
  });

  test("opens CommentsDialog when StoryCard triggers onOpenComments", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 10, title: "Story A", time: 10 },
      { id: 20, title: "Story B", time: 20 },
    ];

    mockStoriesInfiniteReturn({
      data: { pages: [{ stories }] },
    });

    render(<ShowPage />);

    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");

    await user.click(
      screen.getAllByRole("button", { name: "Open comments" })[1],
    );

    expect(screen.getByTestId("comments-open")).toHaveTextContent("true");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("Story B");

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
  });

  test("infinite scroll triggers fetchNextPage when intersecting and hasNextPage=true", () => {
    const fetchNextPage = jest.fn();

    // Override IntersectionObserver just for this test so we can invoke callback
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
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(<ShowPage />);

    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });
});
