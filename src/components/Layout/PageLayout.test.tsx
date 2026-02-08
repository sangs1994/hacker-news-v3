import React from "react";
import { render, screen } from "@testing-library/react";
import PageLayout from "./PageLayout";

describe("PageLayout", () => {
  test("renders without crashing", () => {
    render(
      <PageLayout>
        <div>Content</div>
      </PageLayout>,
    );

    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  test("renders children correctly", () => {
    render(
      <PageLayout>
        <h1>Page Title</h1>
        <p>Page description</p>
      </PageLayout>,
    );

    expect(
      screen.getByRole("heading", { name: "Page Title" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Page description")).toBeInTheDocument();
  });

  test("does not alter or duplicate children", () => {
    render(
      <PageLayout>
        <span data-testid="child">Inner content</span>
      </PageLayout>,
    );

    const child = screen.getByTestId("child");
    expect(child).toHaveTextContent("Inner content");
  });

  test("wraps children inside layout containers", () => {
    const { container } = render(
      <PageLayout>
        <div>Wrapped</div>
      </PageLayout>,
    );

    // Paper renders as a div by default
    const paper = container.firstChild as HTMLElement;
    expect(paper).toBeInTheDocument();

    // Box is the direct child of Paper
    const box = paper.firstChild as HTMLElement;
    expect(box).toBeInTheDocument();

    // Child is inside Box
    expect(box).toContainElement(screen.getByText("Wrapped"));
  });
});
