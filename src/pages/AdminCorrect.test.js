import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import AdminCorrect from "./AdminCorrect"; // Adjust path if needed
import '@testing-library/jest-dom';

describe("AdminCorrect Component", () => {
  test("renders Admin Homepage title", () => {
    render(<AdminCorrect />);
    expect(screen.getByText("Admin Homepage")).toBeInTheDocument();
  });

  test("renders logo", () => {
    render(<AdminCorrect />);
    expect(screen.getByAltText("Logo")).toBeInTheDocument();
  });

  test("shows welcome box initially", () => {
    render(<AdminCorrect />);
    expect(screen.getByText("Welcome, Admin!")).toBeInTheDocument();
  });

  test("closes welcome box when close button is clicked", () => {
    render(<AdminCorrect />);
    const closeButton = screen.getByText("×");
    fireEvent.click(closeButton);
    expect(screen.queryByText("Welcome, Admin!")).not.toBeInTheDocument();
  });

  test("menu toggles on clicking menu button", () => {
    render(<AdminCorrect />);
    const menuButton = screen.getByRole("button", { name: "☰" });

    // Open menu
    fireEvent.click(menuButton);
    expect(screen.getByText("Settings")).toBeVisible();

    // Close menu
    fireEvent.click(menuButton);
    expect(screen.queryByText("Settings")).not.toBeVisible();
  });
});
