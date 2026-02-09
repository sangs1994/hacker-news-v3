import * as React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import StoryCard from "../StoryCard";

import { hostFromUrl } from "../../../utils/url";
import { timeAgo } from "../../../utils/time";

jest.mock("../../../utils/url", () => ({
  hostFromUrl: jest.fn(),
}));

jest.mock("../../../utils/time", () => ({
  timeAgo: jest.fn(),
}));

describe("StoryCard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (hostFromUrl as jest.Mock).mockReturnValue("example.com");
    (timeAgo as jest.Mock).mockReturnValue("5m ago");
  });

  const baseStory: any = {
    id: 123,
    title: "Hello HN",
    url: "https://www.example.com/post",
    by: "alice",
    time: 1700000000,
    score: 42,
    descendants: 10,
  };

  test("renders index and title", () => {
    render(
      <StoryCard story={baseStory} index={1} onOpenComments={jest.fn()} />,
    );

    expect(screen.getByText("1. Hello HN")).toBeInTheDocument();
  });

  test("renders hostname using hostFromUrl(url)", () => {
    render(
      <StoryCard story={baseStory} index={1} onOpenComments={jest.fn()} />,
    );

    expect(hostFromUrl).toHaveBeenCalledWith(baseStory.url);
    expect(screen.getByText("example.com")).toBeInTheDocument();
  });

  test("renders score when score is a number", () => {
    render(
      <StoryCard story={baseStory} index={1} onOpenComments={jest.fn()} />,
    );

    expect(screen.getByText("42 points")).toBeInTheDocument();
  });

  test("does NOT render score when score is not a number", () => {
    const story = { ...baseStory, score: undefined };

    render(<StoryCard story={story} index={1} onOpenComments={jest.fn()} />);

    expect(screen.queryByText(/points/i)).not.toBeInTheDocument();
  });

  test("renders author and time string using timeAgo(story.time)", () => {
    render(
      <StoryCard story={baseStory} index={1} onOpenComments={jest.fn()} />,
    );

    expect(timeAgo).toHaveBeenCalledWith(baseStory.time);
    expect(screen.getByText(/by alice/i)).toBeInTheDocument();
    expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
  });

  test("clicking Comments button calls onOpenComments with story id", async () => {
    const user = userEvent.setup();
    const onOpenComments = jest.fn();

    render(
      <StoryCard story={baseStory} index={1} onOpenComments={onOpenComments} />,
    );

    await user.click(screen.getByRole("button", { name: "Comments (10)" }));
    expect(onOpenComments).toHaveBeenCalledTimes(1);
    expect(onOpenComments).toHaveBeenCalledWith(123);
  });

  test("shows Comments (0) when descendants is missing", () => {
    const story = { ...baseStory, descendants: undefined };

    render(<StoryCard story={story} index={1} onOpenComments={jest.fn()} />);

    expect(
      screen.getByRole("button", { name: "Comments (0)" }),
    ).toBeInTheDocument();
  });
});
