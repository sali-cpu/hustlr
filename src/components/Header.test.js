import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "./Header";
import '@testing-library/jest-dom';

describe("Header Component", () => {
  test("renders Hustlr logo text", () => {
    render(<Header />);
    expect(screen.getByText("Hustlr.")).toBeInTheDocument();
  });

  test("sidebar toggles visibility on click", () => {
    render(<Header />);
    
    const toggleButton = screen.getByText("☰");

    // Initially, sidebar should not have class "show"
    const sidebar = screen.getByRole("navigation", { hidden: true }) || document.getElementById("sidebar");
    expect(sidebar.classList.contains("show")).toBe(false);

    // Click to open sidebar
    fireEvent.click(toggleButton);
    expect(sidebar.classList.contains("show")).toBe(true);

    // Click again to close sidebar
    fireEvent.click(toggleButton);
    expect(sidebar.classList.contains("show")).toBe(false);
  });
});
