import * as React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewsFiltersBar from "./NewsFiltersBar";

function atMidnight(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function formatYYYYMMDD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

describe("NewsFiltersBar", () => {
  test("calls onFeedKindChange when a tab is clicked", async () => {
    const user = userEvent.setup();

    const onFeedKindChange = jest.fn();
    const onSearchChange = jest.fn();
    const onSelectedDateChange = jest.fn();

    render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={new Date()}
        onFeedKindChange={onFeedKindChange}
        onSearchChange={onSearchChange}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "New" }));
    expect(onFeedKindChange).toHaveBeenCalledWith("new");

    await user.click(screen.getByRole("tab", { name: "Best" }));
    expect(onFeedKindChange).toHaveBeenCalledWith("best");
  });

  test("calls onSearchChange as user types (all tabs)", async () => {
    const user = userEvent.setup();

    const onFeedKindChange = jest.fn();
    const onSearchChange = jest.fn();
    const onSelectedDateChange = jest.fn();

    render(
      <NewsFiltersBar
        feedKind="new"
        search=""
        selectedDate={new Date()}
        onFeedKindChange={onFeedKindChange}
        onSearchChange={onSearchChange}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    const search = screen.getByPlaceholderText("Search title…");
    await user.type(search, "react query");

    // Called multiple times, verify last call
    expect(onSearchChange).toHaveBeenLastCalledWith("react query");
  });

  test("shows date controls ONLY for top feed", () => {
    const onFeedKindChange = jest.fn();
    const onSearchChange = jest.fn();
    const onSelectedDateChange = jest.fn();

    const { rerender } = render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={new Date()}
        onFeedKindChange={onFeedKindChange}
        onSearchChange={onSearchChange}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    // Top: should have prev/next buttons
    expect(
      screen.getByRole("button", { name: "Previous day" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Next day" }),
    ).toBeInTheDocument();

    // Non-top: should NOT have those buttons
    rerender(
      <NewsFiltersBar
        feedKind="new"
        search=""
        selectedDate={new Date()}
        onFeedKindChange={onFeedKindChange}
        onSearchChange={onSearchChange}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "Previous day" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next day" }),
    ).not.toBeInTheDocument();
  });

  test("Previous day button subtracts 1 day", async () => {
    const user = userEvent.setup();

    const onSelectedDateChange = jest.fn();
    const base = atMidnight(new Date(2026, 1, 8)); // Feb 8, 2026

    render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={base}
        onFeedKindChange={jest.fn()}
        onSearchChange={jest.fn()}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Previous day" }));

    const calledWith = onSelectedDateChange.mock.calls[0][0] as Date;
    expect(formatYYYYMMDD(calledWith)).toBe("2026-02-07");
  });

  test("Next day button adds 1 day but clamps to today", async () => {
    const user = userEvent.setup();

    const onSelectedDateChange = jest.fn();

    // Use "yesterday" relative to real today to avoid timezone issues
    const today = atMidnight(new Date());
    const yesterday = atMidnight(new Date(today));
    yesterday.setDate(today.getDate() - 1);

    render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={yesterday}
        onFeedKindChange={jest.fn()}
        onSearchChange={jest.fn()}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Next day" }));

    const calledWith = onSelectedDateChange.mock.calls[0][0] as Date;
    // Should move to today (not beyond)
    expect(formatYYYYMMDD(calledWith)).toBe(formatYYYYMMDD(today));
  });

  test("Next day button is disabled when selectedDate is today", () => {
    const today = atMidnight(new Date());

    render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={today}
        onFeedKindChange={jest.fn()}
        onSearchChange={jest.fn()}
        onSelectedDateChange={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "Next day" })).toBeDisabled();
  });

  test("hidden native date input has max=today and changing it calls onSelectedDateChange", () => {
    const onSelectedDateChange = jest.fn();
    const selectedDate = atMidnight(new Date(2026, 0, 15)); // Jan 15, 2026

    const today = atMidnight(new Date());
    const todayStr = formatYYYYMMDD(today);

    const { container } = render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={selectedDate}
        onFeedKindChange={jest.fn()}
        onSearchChange={jest.fn()}
        onSelectedDateChange={onSelectedDateChange}
      />,
    );

    const hiddenDateInput = container.querySelector(
      'input[type="date"]',
    ) as HTMLInputElement;
    expect(hiddenDateInput).toBeTruthy();
    expect(hiddenDateInput.max).toBe(todayStr);

    // Change to a valid date string
    fireEvent.change(hiddenDateInput, { target: { value: "2026-01-10" } });
    const calledWith = onSelectedDateChange.mock.calls[0][0] as Date;
    expect(formatYYYYMMDD(calledWith)).toBe("2026-01-10");
  });

  test("visible date field shows selectedDate formatted as YYYY-MM-DD (top)", () => {
    const d = new Date(2026, 1, 8); // 2026-02-08
    d.setHours(0, 0, 0, 0);

    render(
      <NewsFiltersBar
        feedKind="top"
        search=""
        selectedDate={d}
        onFeedKindChange={jest.fn()}
        onSearchChange={jest.fn()}
        onSelectedDateChange={jest.fn()}
      />,
    );

    // The visible field is a TextField with readOnly input and aria-label "Select date"
    const dateField = screen.getByLabelText("Select date") as HTMLInputElement;
    expect(dateField.value).toBe("2026-02-08");
  });
});
