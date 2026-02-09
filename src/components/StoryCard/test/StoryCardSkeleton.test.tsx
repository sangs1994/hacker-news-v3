import * as React from "react";
import { render } from "@testing-library/react";
import { StoriesSkeleton, BestPicksSkeleton } from "../StoryCardSkeleton";

describe("StoriesSkeleton", () => {
  test("renders default number of skeleton cards (5)", () => {
    const { container } = render(<StoriesSkeleton />);
    const cards = container.querySelectorAll(".MuiCard-root");

    expect(cards.length).toBe(5);
  });

  test("renders given number of skeleton cards", () => {
    const { container } = render(<StoriesSkeleton count={3} />);
    const cards = container.querySelectorAll(".MuiCard-root");

    expect(cards.length).toBe(3);
  });
});

describe("BestPicksSkeleton", () => {
  test("renders default number of skeleton cards (4)", () => {
    const { container } = render(<BestPicksSkeleton />);
    const cards = container.querySelectorAll(".MuiCard-root");

    expect(cards.length).toBe(4);
  });

  test("renders given number of skeleton cards", () => {
    const { container } = render(<BestPicksSkeleton count={6} />);
    const cards = container.querySelectorAll(".MuiCard-root");

    expect(cards.length).toBe(6);
  });
});
