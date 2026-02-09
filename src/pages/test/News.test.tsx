import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import News from "../News";
import { useStoriesInfinite } from "../../hooks/useStoriesInfinite";

class MockIntersectionObserver {
  callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(global, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: MockIntersectionObserver,
});

jest.mock("../../hooks/useStoriesInfinite", () => ({
  useStoriesInfinite: jest.fn(),
}));

// Mock StoryCard: shows title and a button to open comments
jest.mock("../../components/StoryCard/StoryCard", () => {
  return function StoryCardMock(props: any) {
    const { story, index, onOpenComments } = props;
    return (
      <div data-testid="story-card">
        <div data-testid="story-index">{String(index)}</div>
        <div data-testid="story-title">{story?.title ?? "no-title"}</div>
        <button onClick={() => onOpenComments(story.id)}>Open comments</button>
      </div>
    );
  };
});

// Mock skeleton
jest.mock("../../components/StoryCard/StoryCardSkeleton", () => ({
  StoriesSkeleton: () => <div data-testid="skeleton">Loading skeleton</div>,
}));

// Mock comments dialog
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

// Mock BlogFiltersBar with real callbacks exposed as buttons/inputs
jest.mock("../../components/NewsFilter/NewsFiltersBar", () => {
  return function BlogFiltersBarMock(props: any) {
    const {
      feedKind,
      search,
      selectedDate,
      onFeedKindChange,
      onSearchChange,
      onSelectedDateChange,
    } = props;

    return (
      <div data-testid="filters">
        <div data-testid="feedKind">{feedKind}</div>

        <button onClick={() => onFeedKindChange("top")}>SetTop</button>
        <button onClick={() => onFeedKindChange("new")}>SetNew</button>
        <button onClick={() => onFeedKindChange("best")}>SetBest</button>

        <input
          aria-label="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />

        <button
          onClick={() =>
            onSelectedDateChange(new Date("2026-02-08T00:00:00.000Z"))
          }
        >
          SetDateFeb8
        </button>

        <div data-testid="selectedDate">
          {selectedDate ? selectedDate.toISOString().slice(0, 10) : "none"}
        </div>
      </div>
    );
  };
});

// IntersectionObserver mock
function installIntersectionObserverMock() {
  const instances: any[] = [];
  // @ts-expect-error
  global.IntersectionObserver = class {
    cb: any;
    constructor(cb: any) {
      this.cb = cb;
      instances.push(this);
    }
    observe() {}
    disconnect() {}
  };
  return instances;
}

function mockStoriesInfiniteReturn(overrides: Partial<any> = {}) {
  const base = {
    data: { pages: [{ stories: [] }] },
    isLoading: false,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
    hasNextPage: false,
  };
  (useStoriesInfinite as jest.Mock).mockReturnValue({ ...base, ...overrides });
  return (useStoriesInfinite as jest.Mock).mock.results.at(-1)?.value;
}

describe("News page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("shows skeleton while loading", () => {
    mockStoriesInfiniteReturn({ isLoading: true });

    render(<News />);
    expect(screen.getByTestId("skeleton")).toBeInTheDocument();
  });

  test("shows 'No stories found.' when empty and no more pages", () => {
    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories: [] }] },
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<News />);
    expect(screen.getByText("No stories found.")).toBeInTheDocument();
  });

  test("shows 'Loading older stories…' when top + filtered empty but hasNextPage=true", async () => {
    // default feedKind in News is "top"
    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories: [] }] },
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });

    render(<News />);
    expect(screen.getByText("Loading older stories…")).toBeInTheDocument();
  });

  test("search filters stories on any tab", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 1, title: "React Query", time: 1700000000 },
      { id: 2, title: "Angular", time: 1700000000 },
    ];

    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories }] },
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<News />);

    // Initially both shown
    expect(screen.getAllByTestId("story-card")).toHaveLength(2);

    // Type search
    await user.type(screen.getByLabelText("search"), "react");

    // Now only React Query should remain
    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["React Query"]);
  });

  test("date filter applies ONLY to top: selecting past date hides newer stories", async () => {
    const user = userEvent.setup();

    // Two stories: one after Feb 8, one before Feb 8 (based on ms)
    // Feb 8 end-of-day should include story on Feb 8 or earlier, exclude Feb 10.
    const storyOld = {
      id: 1,
      title: "Feb 1 story",
      time: Math.floor(new Date("2026-02-01T12:00:00Z").getTime() / 1000),
    };
    const storyNew = {
      id: 2,
      title: "Feb 10 story",
      time: Math.floor(new Date("2026-02-10T12:00:00Z").getTime() / 1000),
    };

    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories: [storyOld, storyNew] }] },
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<News />);

    // Default feedKind is top, no date change yet -> selectedDate starts at today,
    // so both could be visible. Now set date to Feb 8 -> should filter out Feb 10 story.
    await user.click(screen.getByRole("button", { name: "SetDateFeb8" }));

    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["Feb 1 story"]);
  });

  test("date filter does NOT apply for non-top tabs (new/best)", async () => {
    const user = userEvent.setup();

    const storyOld = {
      id: 1,
      title: "Feb 1 story",
      time: Math.floor(new Date("2026-02-01T12:00:00Z").getTime() / 1000),
    };
    const storyNew = {
      id: 2,
      title: "Feb 10 story",
      time: Math.floor(new Date("2026-02-10T12:00:00Z").getTime() / 1000),
    };

    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories: [storyOld, storyNew] }] },
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<News />);

    // switch to New
    await user.click(screen.getByRole("button", { name: "SetNew" }));

    // set date to Feb 8 (should not filter because not top)
    await user.click(screen.getByRole("button", { name: "SetDateFeb8" }));

    const titles = screen
      .getAllByTestId("story-title")
      .map((n) => n.textContent);
    expect(titles).toEqual(["Feb 1 story", "Feb 10 story"]);
  });

  test("clicking StoryCard opens CommentsDialog with correct story", async () => {
    const user = userEvent.setup();

    const stories = [
      { id: 10, title: "Story A", time: 1700000000 },
      { id: 20, title: "Story B", time: 1700000000 },
    ];

    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories }] },
      hasNextPage: false,
      isFetchingNextPage: false,
    });

    render(<News />);

    // Initially closed
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("none");

    // Open comments for second story
    const openBtns = screen.getAllByRole("button", { name: "Open comments" });
    await user.click(openBtns[1]);

    expect(screen.getByTestId("comments-open")).toHaveTextContent("true");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("Story B");

    // Close
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(screen.getByTestId("comments-open")).toHaveTextContent("false");
    expect(screen.getByTestId("comments-story")).toHaveTextContent("none");
  });

  test("infinite scroll triggers fetchNextPage when sentinel intersects and hasNextPage=true", () => {
    const ioInstances = installIntersectionObserverMock();

    const fetchNextPage = jest.fn();
    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories: [{ id: 1, title: "X", time: 1700000000 }] }] },
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(<News />);

    // trigger intersection callback
    ioInstances[0].cb([{ isIntersecting: true }]);

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  test("does NOT fetch next page when already fetching or no next page", () => {
    const ioInstances = installIntersectionObserverMock();

    const fetchNextPage = jest.fn();
    mockStoriesInfiniteReturn({
      isLoading: false,
      data: { pages: [{ stories: [{ id: 1, title: "X", time: 1700000000 }] }] },
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage,
    });

    render(<News />);
    ioInstances[0].cb([{ isIntersecting: true }]);
    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});
