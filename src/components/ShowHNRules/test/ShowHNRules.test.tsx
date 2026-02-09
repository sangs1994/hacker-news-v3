import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ShowHNRulesDialog from "./ShowHNRules";

describe("ShowHNRulesDialog", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  test("renders nothing (or at least no title) when open=false", () => {
    render(<ShowHNRulesDialog open={false} onClose={jest.fn()} />);

    expect(
      screen.queryByText("Show HN — Rules & Tips"),
    ).not.toBeInTheDocument();
  });

  test("renders title and key sections when open=true", () => {
    render(<ShowHNRulesDialog open={true} onClose={jest.fn()} />);

    expect(screen.getByText("Show HN — Rules & Tips")).toBeInTheDocument();
    expect(screen.getByText("On-topic")).toBeInTheDocument();
    expect(screen.getByText("Off-topic")).toBeInTheDocument();
    expect(screen.getByText("Best practices")).toBeInTheDocument();

    // one bullet text to ensure list renders
    expect(
      screen.getByText(/Make it easy for users to try your thing/i),
    ).toBeInTheDocument();
  });

  test("Close button calls onClose", async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();

    render(<ShowHNRulesDialog open={true} onClose={onClose} />);

    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("Open Official Page button calls window.open with correct args", async () => {
    const user = userEvent.setup();
    const openSpy = jest.spyOn(window, "open").mockImplementation(() => null);

    render(<ShowHNRulesDialog open={true} onClose={jest.fn()} />);

    await user.click(
      screen.getByRole("button", { name: "Open Official Page" }),
    );

    expect(openSpy).toHaveBeenCalledTimes(1);
    expect(openSpy).toHaveBeenCalledWith(
      "https://news.ycombinator.com/showhn.html",
      "_blank",
      "noopener,noreferrer",
    );
  });

  test("Escape key triggers onClose (Dialog onClose)", () => {
    const onClose = jest.fn();
    render(<ShowHNRulesDialog open={true} onClose={onClose} />);

    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  test("Backdrop click triggers onClose (Dialog onClose)", () => {
    const onClose = jest.fn();
    render(<ShowHNRulesDialog open={true} onClose={onClose} />);

    // MUI renders a backdrop element with this class
    const backdrop = document.querySelector(".MuiBackdrop-root");
    expect(backdrop).toBeTruthy();

    fireEvent.mouseDown(backdrop as Element);
    fireEvent.click(backdrop as Element);

    expect(onClose).toHaveBeenCalled();
  });
});
