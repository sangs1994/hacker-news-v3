import React from "react";
import { render, screen } from "@testing-library/react";
import App from "./App";

jest.mock("./pages/News", () => () => <div>News Page</div>);
jest.mock("./pages/Ask", () => () => <div>Ask Page</div>);
jest.mock("./pages/Show", () => () => <div>Show Page</div>);
jest.mock("./pages/Jobs", () => () => <div>Jobs Page</div>);

jest.mock("./components/Header/Header", () => () => <div>Header</div>);
jest.mock("./components/Layout/PageLayout", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

describe("App routing (HashRouter)", () => {
  beforeEach(() => {
    window.location.hash = "";
  });

  test("renders Header and layout", () => {
    render(<App />);
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByTestId("layout")).toBeInTheDocument();
  });

  test("default route (#/ or empty hash) shows NewsPage", () => {
    window.location.hash = "#/";
    render(<App />);
    expect(screen.getByText("News Page")).toBeInTheDocument();
  });

  test("route #/news shows NewsPage", () => {
    window.location.hash = "#/news";
    render(<App />);
    expect(screen.getByText("News Page")).toBeInTheDocument();
  });

  test("route #/ask shows Ask page", () => {
    window.location.hash = "#/ask";
    render(<App />);
    expect(screen.getByText("Ask Page")).toBeInTheDocument();
  });

  test("route #/show shows Show page", () => {
    window.location.hash = "#/show";
    render(<App />);
    expect(screen.getByText("Show Page")).toBeInTheDocument();
  });

  test("route #/jobs shows Jobs page", () => {
    window.location.hash = "#/jobs";
    render(<App />);
    expect(screen.getByText("Jobs Page")).toBeInTheDocument();
  });
});
