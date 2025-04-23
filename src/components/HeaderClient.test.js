import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import HeaderClient from "./HeaderClient";
import '@testing-library/jest-dom';


describe("HeaderClient Component", () => {
  beforeEach(() => {
    // Reset body class for each test
    document.body.className = "";
  });

  test("renders logo text", () => {
    render(<HeaderClient />);
    expect(screen.getByText("Hustlr.")).toBeInTheDocument();
  });

  test("menu toggle opens and closes mobile menu", () => {
    render(<HeaderClient />);

    const openButton = screen.getByRole("button", { name: "" });
    fireEvent.click(openButton);

    // After clicking open
    expect(document.body.classList.contains("show-mobile-menu")).toBe(true);

    const closeButton = screen.getByRole("button", { name: "" });
    fireEvent.click(closeButton);

    // After clicking close
    expect(document.body.classList.contains("show-mobile-menu")).toBe(false);
  });

  test("renders all navigation links", () => {
    render(<HeaderClient />);
    expect(screen.getByText("Ongoing Projects")).toBeInTheDocument();
    expect(screen.getByText("Earnings")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Recent Activities")).toBeInTheDocument();
    expect(screen.getByText("Sign Out")).toBeInTheDocument();
  });
});
