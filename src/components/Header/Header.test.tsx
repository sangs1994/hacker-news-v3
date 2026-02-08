import React from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Header from "./Header";
import { useLocation } from "react-router-dom";

const mockNavigate = jest.fn();

// Mock only hooks; keep real NavLink/MemoryRouter
jest.mock("react-router-dom", () => {
  const actual = jest.requireActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: jest.fn(),
  };
});

describe("Header", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
  });

  function setPath(pathname: string) {
    (useLocation as unknown as jest.Mock).mockReturnValue({ pathname });
  }

  function renderWithRouter() {
    return render(
      <MemoryRouter initialEntries={["/news"]}>
        <Header />
      </MemoryRouter>,
    );
  }

  test("renders brand + title", () => {
    setPath("/news");
    renderWithRouter();

    expect(screen.getByText("HN")).toBeInTheDocument();
    expect(screen.getByText("Hacker News")).toBeInTheDocument();
  });

  test("opens the More menu and shows the non-primary tab(s)", async () => {
    const user = userEvent.setup();
    setPath("/news");
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: "More" }));

    const menu = screen.getByRole("menu");
    expect(
      within(menu).getByRole("menuitem", { name: "Show" }),
    ).toBeInTheDocument();
  });

  test("clicking a menu item navigates and closes the menu", async () => {
    const user = userEvent.setup();
    setPath("/news");
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: "More" }));

    const menu = screen.getByRole("menu");
    await user.click(within(menu).getByRole("menuitem", { name: "Show" }));

    expect(mockNavigate).toHaveBeenCalledWith("/show");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("Escape closes the menu", async () => {
    const user = userEvent.setup();
    setPath("/news");
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  test("fallback: when path is '/', it still renders and menu works", async () => {
    const user = userEvent.setup();
    setPath("/");
    renderWithRouter();

    await user.click(screen.getByRole("button", { name: "More" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  test("renders action buttons (Submit/Login)", () => {
    setPath("/news");
    renderWithRouter();

    // Text exists in DOM even if hidden via CSS on xs
    expect(screen.getByText("Submit")).toBeInTheDocument();
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});
